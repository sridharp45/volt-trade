package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	sc "github.com/hyperledger/fabric-protos-go/peer"
	"github.com/hyperledger/fabric/common/flogging"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

// SmartContract Define the Smart Contract structure
type SmartContract struct {
}

// Car :  Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"`
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

type carPrivateDetails struct {
	Owner string `json:"owner"`
	Price string `json:"price"`
}

type Transaction struct {
    TypeOfTransaction  string `json:"typeOfTransaction"`  // 1 or 2
    SenderId           string `json:"senderId"`           // Sender's User ID
    ReceiverId         string `json:"receiverId"`         // Receiver's User ID
    SenderVehicle      string `json:"senderVehicle"`      // Sender's Vehicle ID
    ReceiverVehicle    string `json:"receiverVehicle"`    // Receiver's Vehicle ID
    CommittedEnergy    float64 `json:"committedEnergy"`    // Energy to be transferred
    TransferredEnergy  float64 `json:"transferredEnergy"`  // Energy that has been transferred, default is "0"
    TransactionStatus  string `json:"transactionStatus"`  // Status of transaction: Completed, Incomplete, InProgress, or Failed
    ChargePerUnit      float64 `json:"chargePerUnit"`      // Cost per unit of energy
    Credits            float64 `json:"credits"`           // Total credits involved in the transaction
	CreatedAt          string `json:"createdAt"`        // Time of transaction creation
}

type User struct {
    ID           string   `json:"id"`           // Unique identifier for the user
    Username     string   `json:"username"`     // User's name
    Email        string   `json:"email"`        // User's email address
    Phone        string   `json:"phone"`        // User's phone number (optional)
    Password     string   `json:"password"`     // User's password
    Organization string   `json:"organization"` // Organization associated with the user
    Balance      float64  `json:"balance"`      // User's wallet balance (default: 1000000)
    Icon         string   `json:"icon"`         // URL or path to user's profile icon (optional)
    Vehicles     []string `json:"vehicles"`     // List of vehicle IDs associated with the user
}

// Init ;  Method for initializing smart contract
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

var logger = flogging.MustGetLogger("fabcar_cc")

// Invoke :  Method for INVOKING smart contract
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	logger.Infof("Function name is:  %d", function)
	logger.Infof("Args length is : %d", len(args))

	switch function {
	case "queryCar":
		return s.queryCar(APIstub, args)
	case "initLedger":
		return s.initLedger(APIstub)
	case "createCar":
		return s.createCar(APIstub, args)
	case "queryAllCars":
		return s.queryAllCars(APIstub)
	case "changeCarOwner":
		return s.changeCarOwner(APIstub, args)
	case "getHistoryForAsset":
		return s.getHistoryForAsset(APIstub, args)
	case "queryCarsByOwner":
		return s.queryCarsByOwner(APIstub, args)
	case "restictedMethod":
		return s.restictedMethod(APIstub, args)
	case "test":
		return s.test(APIstub, args)
	case "createPrivateCar":
		return s.createPrivateCar(APIstub, args)
	case "readPrivateCar":
		return s.readPrivateCar(APIstub, args)
	case "updatePrivateData":
		return s.updatePrivateData(APIstub, args)
	case "readCarPrivateDetails":
		return s.readCarPrivateDetails(APIstub, args)
	case "createPrivateCarImplicitForOrg1":
		return s.createPrivateCarImplicitForOrg1(APIstub, args)
	case "createPrivateCarImplicitForOrg2":
		return s.createPrivateCarImplicitForOrg2(APIstub, args)
	case "queryPrivateDataHash":
		return s.queryPrivateDataHash(APIstub, args)
	case "initiateTransaction":
		return s.initiateTransaction(APIstub, args)
	case "preCheckTransaction":
		return s.preCheckTransaction(APIstub, args)
	case "updateTransactionStats":
		return s.updateTransactionStats(APIstub, args)
	case "getTransactionHistoryByUser":
		return s.getTransactionHistoryByUser(APIstub, args)
	case "getAllTransactions":
		return s.getAllTransactions(APIstub)
	case "updateTransaction":
		return s.updateTransaction(APIstub, args)
	default:
		return shim.Error("Invalid Smart Contract function name.")
	}

}

func (s *SmartContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(carAsBytes)
}

func (s *SmartContract) readPrivateCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	// collectionCars, collectionCarPrivateDetails, _implicit_org_Org1MSP, _implicit_org_Org2MSP
	carAsBytes, err := APIstub.GetPrivateData(args[0], args[1])
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get private details for " + args[1] + ": " + err.Error() + "\"}"
		return shim.Error(jsonResp)
	} else if carAsBytes == nil {
		jsonResp := "{\"Error\":\"Car private details does not exist: " + args[1] + "\"}"
		return shim.Error(jsonResp)
	}
	return shim.Success(carAsBytes)
}

func (s *SmartContract) readPrivateCarIMpleciteForOrg1(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetPrivateData("_implicit_org_Org1MSP", args[0])
	return shim.Success(carAsBytes)
}

func (s *SmartContract) readCarPrivateDetails(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, err := APIstub.GetPrivateData("collectionCarPrivateDetails", args[0])

	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get private details for " + args[0] + ": " + err.Error() + "\"}"
		return shim.Error(jsonResp)
	} else if carAsBytes == nil {
		jsonResp := "{\"Error\":\"Marble private details does not exist: " + args[0] + "\"}"
		return shim.Error(jsonResp)
	}
	return shim.Success(carAsBytes)
}

func (s *SmartContract) test(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(carAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	cars := []Car{
		Car{Make: "Toyota", Model: "Prius", Colour: "blue", Owner: "Tomoko"},
		Car{Make: "Ford", Model: "Mustang", Colour: "red", Owner: "Brad"},
		Car{Make: "Hyundai", Model: "Tucson", Colour: "green", Owner: "Jin Soo"},
		Car{Make: "Volkswagen", Model: "Passat", Colour: "yellow", Owner: "Max"},
		Car{Make: "Tesla", Model: "S", Colour: "black", Owner: "Adriana"},
		Car{Make: "Peugeot", Model: "205", Colour: "purple", Owner: "Michel"},
		Car{Make: "Chery", Model: "S22L", Colour: "white", Owner: "Aarav"},
		Car{Make: "Fiat", Model: "Punto", Colour: "violet", Owner: "Pari"},
		Car{Make: "Tata", Model: "Nano", Colour: "indigo", Owner: "Valeria"},
		Car{Make: "Holden", Model: "Barina", Colour: "brown", Owner: "Shotaro"},
	}

	i := 0
	for i < len(cars) {
		carAsBytes, _ := json.Marshal(cars[i])
		APIstub.PutState("CAR"+strconv.Itoa(i), carAsBytes)
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createPrivateCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	type carTransientInput struct {
		Make  string `json:"make"` //the fieldtags are needed to keep case from bouncing around
		Model string `json:"model"`
		Color string `json:"color"`
		Owner string `json:"owner"`
		Price string `json:"price"`
		Key   string `json:"key"`
	}
	if len(args) != 0 {
		return shim.Error("1111111----Incorrect number of arguments. Private marble data must be passed in transient map.")
	}

	logger.Infof("11111111111111111111111111")

	transMap, err := APIstub.GetTransient()
	if err != nil {
		return shim.Error("222222 -Error getting transient: " + err.Error())
	}

	carDataAsBytes, ok := transMap["car"]
	if !ok {
		return shim.Error("car must be a key in the transient map")
	}
	logger.Infof("********************8   " + string(carDataAsBytes))

	if len(carDataAsBytes) == 0 {
		return shim.Error("333333 -marble value in the transient map must be a non-empty JSON string")
	}

	logger.Infof("2222222")

	var carInput carTransientInput
	err = json.Unmarshal(carDataAsBytes, &carInput)
	if err != nil {
		return shim.Error("44444 -Failed to decode JSON of: " + string(carDataAsBytes) + "Error is : " + err.Error())
	}

	logger.Infof("3333")

	if len(carInput.Key) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(carInput.Make) == 0 {
		return shim.Error("color field must be a non-empty string")
	}
	if len(carInput.Model) == 0 {
		return shim.Error("model field must be a non-empty string")
	}
	if len(carInput.Color) == 0 {
		return shim.Error("color field must be a non-empty string")
	}
	if len(carInput.Owner) == 0 {
		return shim.Error("owner field must be a non-empty string")
	}
	if len(carInput.Price) == 0 {
		return shim.Error("price field must be a non-empty string")
	}

	logger.Infof("444444")

	// ==== Check if car already exists ====
	carAsBytes, err := APIstub.GetPrivateData("collectionCars", carInput.Key)
	if err != nil {
		return shim.Error("Failed to get marble: " + err.Error())
	} else if carAsBytes != nil {
		fmt.Println("This car already exists: " + carInput.Key)
		return shim.Error("This car already exists: " + carInput.Key)
	}

	logger.Infof("55555")

	var car = Car{Make: carInput.Make, Model: carInput.Model, Colour: carInput.Color, Owner: carInput.Owner}

	carAsBytes, err = json.Marshal(car)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = APIstub.PutPrivateData("collectionCars", carInput.Key, carAsBytes)
	if err != nil {
		logger.Infof("6666666")
		return shim.Error(err.Error())
	}

	carPrivateDetails := &carPrivateDetails{Owner: carInput.Owner, Price: carInput.Price}

	carPrivateDetailsAsBytes, err := json.Marshal(carPrivateDetails)
	if err != nil {
		logger.Infof("77777")
		return shim.Error(err.Error())
	}

	err = APIstub.PutPrivateData("collectionCarPrivateDetails", carInput.Key, carPrivateDetailsAsBytes)
	if err != nil {
		logger.Infof("888888")
		return shim.Error(err.Error())
	}

	return shim.Success(carAsBytes)
}

func (s *SmartContract) updatePrivateData(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	type carTransientInput struct {
		Owner string `json:"owner"`
		Price string `json:"price"`
		Key   string `json:"key"`
	}
	if len(args) != 0 {
		return shim.Error("1111111----Incorrect number of arguments. Private marble data must be passed in transient map.")
	}

	logger.Infof("11111111111111111111111111")

	transMap, err := APIstub.GetTransient()
	if err != nil {
		return shim.Error("222222 -Error getting transient: " + err.Error())
	}

	carDataAsBytes, ok := transMap["car"]
	if !ok {
		return shim.Error("car must be a key in the transient map")
	}
	logger.Infof("********************8   " + string(carDataAsBytes))

	if len(carDataAsBytes) == 0 {
		return shim.Error("333333 -marble value in the transient map must be a non-empty JSON string")
	}

	logger.Infof("2222222")

	var carInput carTransientInput
	err = json.Unmarshal(carDataAsBytes, &carInput)
	if err != nil {
		return shim.Error("44444 -Failed to decode JSON of: " + string(carDataAsBytes) + "Error is : " + err.Error())
	}

	carPrivateDetails := &carPrivateDetails{Owner: carInput.Owner, Price: carInput.Price}

	carPrivateDetailsAsBytes, err := json.Marshal(carPrivateDetails)
	if err != nil {
		logger.Infof("77777")
		return shim.Error(err.Error())
	}

	err = APIstub.PutPrivateData("collectionCarPrivateDetails", carInput.Key, carPrivateDetailsAsBytes)
	if err != nil {
		logger.Infof("888888")
		return shim.Error(err.Error())
	}

	return shim.Success(carPrivateDetailsAsBytes)

}

func (s *SmartContract) createCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	carAsBytes, _ := json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	indexName := "owner~key"
	colorNameIndexKey, err := APIstub.CreateCompositeKey(indexName, []string{car.Owner, args[0]})
	if err != nil {
		return shim.Error(err.Error())
	}
	value := []byte{0x00}
	APIstub.PutState(colorNameIndexKey, value)

	return shim.Success(carAsBytes)
}

func (s *SmartContract) initiateTransaction(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    if len(args) != 11 {
        return shim.Error("Incorrect number of arguments. Expecting 11: typeOfTransaction, senderId, receiverId, senderVehicle, receiverVehicle, committedEnergy, credits, chargePerUnit, tradeState, transactionId, createdAt")
    }

    typeOfTransaction := args[0]
    senderId := args[1]
    receiverId := args[2]
    senderVehicle := args[3]
    receiverVehicle := args[4]

    committedEnergy, err := strconv.ParseFloat(args[5], 64)
    if err != nil {
        return shim.Error("Invalid value for committedEnergy: " + err.Error())
    }

    credits, err := strconv.ParseFloat(args[6], 64)
    if err != nil {
        return shim.Error("Invalid value for credits: " + err.Error())
    }

    chargePerUnit, err := strconv.ParseFloat(args[7], 64)
    if err != nil {
        return shim.Error("Invalid value for chargePerUnit: " + err.Error())
    }

    tradeState := args[8]
    transactionId := args[9]
    createdAt := args[10]

    if tradeState != "accepted" {
        return shim.Error("Trade is not in 'accepted' state.")
    }

    transaction := Transaction{
        TypeOfTransaction: typeOfTransaction,
        SenderId:          senderId,
        ReceiverId:        receiverId,
        SenderVehicle:     senderVehicle,
        ReceiverVehicle:   receiverVehicle,
        CommittedEnergy:   committedEnergy,
        Credits:           credits,
        ChargePerUnit:     chargePerUnit,
        TransferredEnergy: 0,
        TransactionStatus: "InProgress",
        CreatedAt:         createdAt,
    }

    transactionAsBytes, err := json.Marshal(transaction)
    if err != nil {
        return shim.Error("Error marshaling transaction data: " + err.Error())
    }

    transactionKey := transactionId
    err = APIstub.PutState(transactionKey, transactionAsBytes)
    if err != nil {
        return shim.Error("Failed to save transaction: " + err.Error())
    }

    senderCompositeKey, err := APIstub.CreateCompositeKey("TransactionSender", []string{senderId, transactionId})
    if err != nil {
        return shim.Error("Error creating sender composite key: " + err.Error())
    }

    receiverCompositeKey, err := APIstub.CreateCompositeKey("TransactionReceiver", []string{receiverId, transactionId})
    if err != nil {
        return shim.Error("Error creating receiver composite key: " + err.Error())
    }

    allTransactionsCompositeKey, err := APIstub.CreateCompositeKey("AllTransactions", []string{transactionId})
    if err != nil {
        return shim.Error("Error creating all transactions composite key: " + err.Error())
    }

    err = APIstub.PutState(senderCompositeKey, transactionAsBytes)
    if err != nil {
        return shim.Error("Failed to save transaction for sender: " + err.Error())
    }

    err = APIstub.PutState(receiverCompositeKey, transactionAsBytes)
    if err != nil {
        return shim.Error("Failed to save transaction for receiver: " + err.Error())
    }

    err = APIstub.PutState(allTransactionsCompositeKey, transactionAsBytes)
    if err != nil {
        return shim.Error("Failed to save transaction for all transactions: " + err.Error())
    }

    tradeState = "inProgress"

    jsonResp := fmt.Sprintf("{\"Success\":\"Transaction initiated. Transaction Key: %s , Trade State: %s\"}", transactionKey, tradeState)
    return shim.Success([]byte(jsonResp))
}


func (s *SmartContract) preCheckTransaction(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    if len(args) != 4 {
        return shim.Error("Incorrect number of arguments. Expecting 4: committedEnergy, chargePerUnit, senderVehicleCurrentCapacity, receieverBalance")
    }

	// Parse numerical values
    committedEnergy, err := strconv.ParseFloat(args[0], 64)
	if err != nil {
		return shim.Error("Invalid value for committedEnergy: " + err.Error())
	}

    chargePerUnit, err := strconv.ParseFloat(args[1], 64)
	if err != nil {
		return shim.Error("Invalid value for chargePerUnit: " + err.Error())
	}

	senderVehicleCurrentCapacity, err := strconv.ParseFloat(args[2], 64)
	if err != nil {
		return shim.Error("Invalid value for senderVehicleCurrentCapacity: " + err.Error())
	}
	receiverBalance, err := strconv.ParseFloat(args[3], 64)
	if err != nil {
		return shim.Error("Invalid value for receiverBalance: " + err.Error())
	}

    // Calculate required values
    requiredEnergy := committedEnergy
    requiredMoney := requiredEnergy * chargePerUnit

    // Check if the sender has enough energy
    if senderVehicleCurrentCapacity < requiredEnergy {
        jsonResp := fmt.Sprintf(`{
            "message": "Sender does not have enough energy available.",
            "available_energy": %.2f
        }`, senderVehicleCurrentCapacity)
        return shim.Success([]byte(jsonResp))
    }

    // Check if the receiver has enough money
    if receiverBalance < requiredMoney {
        jsonResp := fmt.Sprintf(`{
            "message": "Receiver does not have enough wallet balance.",
            "available_balance": %.2f,
            "required_balance": %.2f
        }`, receiverBalance, requiredMoney)
        return shim.Success([]byte(jsonResp))
    }

    // Return success response
    jsonResp := `{
        "message": "Pre-check successful. Sender has enough energy, and receiver has enough money."
    }`
    return shim.Success([]byte(jsonResp))
}

func (s *SmartContract) updateTransactionStats(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    if len(args) != 7 {
        return shim.Error("Incorrect number of arguments. Expecting 7: transferredEnergy, transactionStatus, chargePerUnit, senderBalance, receiverBalance, tradeState, transactionId")
    }

    transferredEnergy, err := strconv.ParseFloat(args[0], 64)
    if err != nil {
        return shim.Error("Invalid value for transferredEnergy: " + err.Error())
    }

    transactionStatus := args[1]

    chargePerUnit, err := strconv.ParseFloat(args[2], 64)
    if err != nil {
        return shim.Error("Invalid value for chargePerUnit: " + err.Error())
    }

	senderBalance, err := strconv.ParseFloat(args[3], 64)
	if err != nil {
		return shim.Error("Invalid value for senderBalance: " + err.Error())
	}

	receiverBalance, err := strconv.ParseFloat(args[4], 64)
	if err != nil {
		return shim.Error("Invalid value for receiverBalance: " + err.Error())
	}
	tradeState := args[5]
	transactionId := args[6]

    // Fetch the transaction
    transactionAsBytes, err := APIstub.GetState(transactionId)
    if err != nil || transactionAsBytes == nil {
        return shim.Error("Transaction not found")
    }

    var transaction Transaction
    err = json.Unmarshal(transactionAsBytes, &transaction)
    if err != nil {
        return shim.Error("Failed to parse transaction: " + err.Error())
    }

    if transactionStatus == "Completed" || transactionStatus == "Incomplete" {
        energyCost := transferredEnergy * chargePerUnit
        if senderBalance < energyCost {
            return shim.Error("Insufficient funds in sender's wallet")
        }

        senderBalance -= energyCost
        receiverBalance += energyCost
                    
        transaction.TransferredEnergy = transferredEnergy
        transaction.TransactionStatus = transactionStatus
        tradeState = "completed"
    } 

    transactionAsBytes, _ = json.Marshal(transaction)
    err = APIstub.PutState(transactionId, transactionAsBytes)
    if err != nil {
        return shim.Error("Failed to update transaction: " + err.Error())
    }
	jsonResp := fmt.Sprintf("{\"Success\":\"Transaction updated with status: %s Trade status: %s\"}", transactionStatus, tradeState)

    return shim.Success([]byte(jsonResp))
}

func (s *SmartContract) getTransactionHistoryByUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting 1: userId")
    }

    userId := args[0]

    var transactions []map[string]interface{}

    // Fetch transactions where the user is the sender
    resultsIteratorSender, err := APIstub.GetStateByPartialCompositeKey("TransactionSender", []string{userId})
    if err != nil {
        return shim.Error("Error retrieving transactions for sender: " + err.Error())
    }
    defer resultsIteratorSender.Close()

    for resultsIteratorSender.HasNext() {
        queryResponse, err := resultsIteratorSender.Next()
        if err != nil {
            return shim.Error("Error iterating sender query results: " + err.Error())
        }
        var transaction map[string]interface{}
        json.Unmarshal(queryResponse.Value, &transaction)
        transactions = append(transactions, transaction)
    }

    // Fetch transactions where the user is the receiver
    resultsIteratorReceiver, err := APIstub.GetStateByPartialCompositeKey("TransactionReceiver", []string{userId})
    if err != nil {
        return shim.Error("Error retrieving transactions for receiver: " + err.Error())
    }
    defer resultsIteratorReceiver.Close()

    for resultsIteratorReceiver.HasNext() {
        queryResponse, err := resultsIteratorReceiver.Next()
        if err != nil {
            return shim.Error("Error iterating receiver query results: " + err.Error())
        }
        var transaction map[string]interface{}
        json.Unmarshal(queryResponse.Value, &transaction)
        transactions = append(transactions, transaction)
    }

    // Return results
    if len(transactions) == 0 {
        jsonResp := fmt.Sprintf("{\"message\": \"No transactions found for this user.\"}")
        return shim.Success([]byte(jsonResp))
    }

    transactionsAsBytes, _ := json.Marshal(transactions)
    jsonResp := fmt.Sprintf(`{
        "message": "Transactions fetched successfully.",
        "transactions": %s
    }`, string(transactionsAsBytes))
    return shim.Success([]byte(jsonResp))
}

func (s *SmartContract) getAllTransactions(APIstub shim.ChaincodeStubInterface) sc.Response {
	
	// Query the ledger using a composite key for all transactions
	resultsIterator, err := APIstub.GetStateByPartialCompositeKey("AllTransactions", []string{})
	if err != nil {
		return shim.Error("Failed to query all transactions: " + err.Error())
	}
	defer resultsIterator.Close()

	var transactions []Transaction

	// Iterate through all transactions
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error("Error iterating query results: " + err.Error())
		}

		var transaction Transaction
		err = json.Unmarshal(queryResponse.Value, &transaction)
		if err != nil {
			return shim.Error("Failed to parse transaction: " + err.Error())
		}

		transactions = append(transactions, transaction)
	}

	// Check if no transactions are found
	if len(transactions) == 0 {
		jsonResp := `{"message": "No transactions found."}`
		return shim.Success([]byte(jsonResp))
	}

	// Sort transactions by `CreatedAt` in descending order
	sort.Slice(transactions, func(i, j int) bool {
		timeI, _ := time.Parse(time.RFC3339, transactions[i].CreatedAt)
		timeJ, _ := time.Parse(time.RFC3339, transactions[j].CreatedAt)
		return timeI.After(timeJ) // Descending order
	})

	// Marshal sorted transactions to JSON
	transactionsAsBytes, err := json.Marshal(transactions)
	if err != nil {
		return shim.Error("Error marshaling transactions: " + err.Error())
	}

	// Prepare the response
	jsonResp := fmt.Sprintf(`{
		"message": "Transactions fetched successfully.",
		"transactions": %s
	}`, string(transactionsAsBytes))
	return shim.Success([]byte(jsonResp))
}


func (s *SmartContract) updateTransaction(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    
	// Ensure the correct number of arguments
    if len(args) < 2 {
        return shim.Error("Incorrect number of arguments. Expecting 2: transactionId and updatedFields as JSON.")
    }

    transactionId := args[0]
    updatedFields := args[1]

    // Fetch the existing transaction from the ledger
    transactionAsBytes, err := APIstub.GetState(transactionId)
    if err != nil {
        return shim.Error("Failed to retrieve transaction: " + err.Error())
    }
    if transactionAsBytes == nil {
        return shim.Error("Transaction not found.")
    }

    // Unmarshal the transaction into a map for updates
    var transaction map[string]interface{}
    err = json.Unmarshal(transactionAsBytes, &transaction)
    if err != nil {
        return shim.Error("Failed to parse existing transaction: " + err.Error())
    }

    // Unmarshal the updated fields
    var updatedFieldsMap map[string]interface{}
    err = json.Unmarshal([]byte(updatedFields), &updatedFieldsMap)
    if err != nil {
        return shim.Error("Failed to parse updated fields: " + err.Error())
    }

    // Apply updates to the transaction
    for key, value := range updatedFieldsMap {
        if _, exists := transaction[key]; exists {
            transaction[key] = value
        }
    }

    // Marshal the updated transaction back to JSON
    updatedTransactionAsBytes, err := json.Marshal(transaction)
    if err != nil {
        return shim.Error("Failed to serialize updated transaction: " + err.Error())
    }

    // Update the ledger with the modified transaction
    err = APIstub.PutState(transactionId, updatedTransactionAsBytes)
    if err != nil {
        return shim.Error("Failed to update transaction in ledger: " + err.Error())
    }

    // Prepare response
    response := map[string]interface{}{
        "message":    "Transaction updated successfully.",
        "transaction": transaction,
    }

    responseBytes, err := json.Marshal(response)
    if err != nil {
        return shim.Error("Failed to construct response: " + err.Error())
    }

    return shim.Success(responseBytes)
}

func (S *SmartContract) queryCarsByOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments")
	}
	owner := args[0]

	ownerAndIdResultIterator, err := APIstub.GetStateByPartialCompositeKey("owner~key", []string{owner})
	if err != nil {
		return shim.Error(err.Error())
	}

	defer ownerAndIdResultIterator.Close()

	var i int
	var id string

	var cars []byte
	bArrayMemberAlreadyWritten := false

	cars = append([]byte("["))

	for i = 0; ownerAndIdResultIterator.HasNext(); i++ {
		responseRange, err := ownerAndIdResultIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		objectType, compositeKeyParts, err := APIstub.SplitCompositeKey(responseRange.Key)
		if err != nil {
			return shim.Error(err.Error())
		}

		id = compositeKeyParts[1]
		assetAsBytes, err := APIstub.GetState(id)

		if bArrayMemberAlreadyWritten == true {
			newBytes := append([]byte(","), assetAsBytes...)
			cars = append(cars, newBytes...)

		} else {
			// newBytes := append([]byte(","), carsAsBytes...)
			cars = append(cars, assetAsBytes...)
		}

		fmt.Printf("Found a asset for index : %s asset id : ", objectType, compositeKeyParts[0], compositeKeyParts[1])
		bArrayMemberAlreadyWritten = true

	}

	cars = append(cars, []byte("]")...)

	return shim.Success(cars)
}

func (s *SmartContract) queryAllCars(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "CAR0"
	endKey := "CAR999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) restictedMethod(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	// get an ID for the client which is guaranteed to be unique within the MSP
	//id, err := cid.GetID(APIstub) -

	// get the MSP ID of the client's identity
	//mspid, err := cid.GetMSPID(APIstub) -

	// get the value of the attribute
	//val, ok, err := cid.GetAttributeValue(APIstub, "attr1") -

	// get the X509 certificate of the client, or nil if the client's identity was not based on an X509 certificate
	//cert, err := cid.GetX509Certificate(APIstub) -

	val, ok, err := cid.GetAttributeValue(APIstub, "role")
	if err != nil {
		// There was an error trying to retrieve the attribute
		shim.Error("Error while retriving attributes")
	}
	if !ok {
		// The client identity does not possess the attribute
		shim.Error("Client identity doesnot posses the attribute")
	}
	// Do something with the value of 'val'
	if val != "approver" {
		fmt.Println("Attribute role: " + val)
		return shim.Error("Only user with role as APPROVER have access this method!")
	} else {
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1")
		}

		carAsBytes, _ := APIstub.GetState(args[0])
		return shim.Success(carAsBytes)
	}

}

func (s *SmartContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	car := Car{}

	json.Unmarshal(carAsBytes, &car)
	car.Owner = args[1]

	carAsBytes, _ = json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(carAsBytes)
}

func (t *SmartContract) getHistoryForAsset(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carName := args[0]

	resultsIterator, err := stub.GetHistoryForKey(carName)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryForAsset returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) createPrivateCarImplicitForOrg1(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect arguments. Expecting 5 arguments")
	}

	var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	carAsBytes, _ := json.Marshal(car)
	// APIstub.PutState(args[0], carAsBytes)

	err := APIstub.PutPrivateData("_implicit_org_Org1MSP", args[0], carAsBytes)
	if err != nil {
		return shim.Error("Failed to add asset: " + args[0])
	}
	return shim.Success(carAsBytes)
}

func (s *SmartContract) createPrivateCarImplicitForOrg2(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect arguments. Expecting 5 arguments")
	}

	var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	carAsBytes, _ := json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	err := APIstub.PutPrivateData("_implicit_org_Org2MSP", args[0], carAsBytes)
	if err != nil {
		return shim.Error("Failed to add asset: " + args[0])
	}
	return shim.Success(carAsBytes)
}

func (s *SmartContract) queryPrivateDataHash(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	carAsBytes, _ := APIstub.GetPrivateDataHash(args[0], args[1])
	return shim.Success(carAsBytes)
}

// func (s *SmartContract) CreateCarAsset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	if len(args) != 1 {
// 		return shim.Error("Incorrect number of arguments. Expecting 1")
// 	}

// 	var car Car
// 	err := json.Unmarshal([]byte(args[0]), &car)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}

// 	carAsBytes, err := json.Marshal(car)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}

// 	err = APIstub.PutState(car.ID, carAsBytes)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}

// 	return shim.Success(nil)
// }

// func (s *SmartContract) addBulkAsset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	logger.Infof("Function addBulkAsset called and length of arguments is:  %d", len(args))
// 	if len(args) >= 500 {
// 		logger.Errorf("Incorrect number of arguments in function CreateAsset, expecting less than 500, but got: %b", len(args))
// 		return shim.Error("Incorrect number of arguments, expecting 2")
// 	}

// 	var eventKeyValue []string

// 	for i, s := range args {

// 		key :=s[0];
// 		var car = Car{Make: s[1], Model: s[2], Colour: s[3], Owner: s[4]}

// 		eventKeyValue = strings.SplitN(s, "#", 3)
// 		if len(eventKeyValue) != 3 {
// 			logger.Errorf("Error occured, Please make sure that you have provided the array of strings and each string should be  in \"EventType#Key#Value\" format")
// 			return shim.Error("Error occured, Please make sure that you have provided the array of strings and each string should be  in \"EventType#Key#Value\" format")
// 		}

// 		assetAsBytes := []byte(eventKeyValue[2])
// 		err := APIstub.PutState(eventKeyValue[1], assetAsBytes)
// 		if err != nil {
// 			logger.Errorf("Error coocured while putting state for asset %s in APIStub, error: %s", eventKeyValue[1], err.Error())
// 			return shim.Error(err.Error())
// 		}
// 		// logger.infof("Adding value for ")
// 		fmt.Println(i, s)

// 		indexName := "Event~Id"
// 		eventAndIDIndexKey, err2 := APIstub.CreateCompositeKey(indexName, []string{eventKeyValue[0], eventKeyValue[1]})

// 		if err2 != nil {
// 			logger.Errorf("Error coocured while putting state in APIStub, error: %s", err.Error())
// 			return shim.Error(err2.Error())
// 		}

// 		value := []byte{0x00}
// 		err = APIstub.PutState(eventAndIDIndexKey, value)
// 		if err != nil {
// 			logger.Errorf("Error coocured while putting state in APIStub, error: %s", err.Error())
// 			return shim.Error(err.Error())
// 		}
// 		// logger.Infof("Created Composite key : %s", eventAndIDIndexKey)

// 	}

// 	return shim.Success(nil)
// }

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
