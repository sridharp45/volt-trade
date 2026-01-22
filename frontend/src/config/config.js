const isRunningLocally = () => window.location.hostname === 'localhost';

const HOST_URL = isRunningLocally() ? "http://localhost:8000" : '';

const BASE_URL1 = HOST_URL+'/api/auth';
const BASE_URL2 = HOST_URL+'/api/users';
const BASE_URL3 = HOST_URL+'/api/vehicles';
const BASE_URL4 = HOST_URL+'/api/trades';
const BASE_URL5 = HOST_URL+'/api/transactions';
const BASE_URL6 = HOST_URL+'/api/tickets';

export const POST_LOGIN_DETAILS_URL = `${BASE_URL1}/login`;
export const POST_SIGNUP_DETAILS_URL = `${BASE_URL1}/signup`;
export const GET_LOGIN_DETAILS_URL = `${BASE_URL2}`;
export const POST_ADD_VEHICLE_URL = `${BASE_URL3}/add`;
export const POST_DELETE_VEHICLE_URL = `${BASE_URL3}/delete`;
export const POST_NEW_REQUEST_URL = `${BASE_URL4}`;
export const GET_ALL_TRADES_URL = `${BASE_URL4}`;
export const DELETE_TRADE_URL = `${BASE_URL4}/cancel`;
export const PUT_ACCCEPT_DETAILS_URL = `${BASE_URL4}/accept`;
export const GET_ACCEPT_DETAILS_URL = `${BASE_URL4}/accepted`;
export const CANCEL_ACCEPT_TRADE_URL = `${BASE_URL4}/cancel-accepted`;
export const PRE_CHECK_TRANSACTION_URL = `${BASE_URL5}/pre-check`;
export const INITIATE_TRANSACTION_URL = `${BASE_URL5}/initiate`;
export const UPDATE_TRANSACTION_URL = `${BASE_URL5}/update`;
export const USER_TRANSACTION_HISTORY_URL = `${BASE_URL5}/history`;
export const ADMIN_TRANSACTION_HISTORY_URL = `${BASE_URL5}`;
export const EDIT_TRADE_URL = `${BASE_URL4}/edit`;
export const CHECK_TRANSACTION_STATUS_URL = `${BASE_URL5}/checkStatus`;
export const CREATE_HELP_URL =  `${BASE_URL6}/create`;
export const GET_HELP_URL =  `${BASE_URL6}`;