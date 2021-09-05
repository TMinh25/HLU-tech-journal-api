// should log timestamp on production enviroment

// const getTimeStamp = (): string => {
// 	return new Date().toISOString();
// };

const info = (namespace: string, message: string, object?: any) => {
	console.log(`[INFO] [${namespace}] ${message}`, object ? object : '');
};

const warn = (namespace: string, message: string, object?: any) => {
	console.warn(`[WARN] [${namespace}] ${message}`, object ? object : '');
};

const error = (namespace: string, message: string, object?: any) => {
	console.log(`[ERROR] [${namespace}] ${message}`, object ? object : '');
};

const debug = (namespace: string, message: string, object?: any) => {
	console.log(`[DEBUG] [${namespace}] ${message}`, object ? object : '');
};

export default {
	info,
	warn,
	error,
	debug
};
