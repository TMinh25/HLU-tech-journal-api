import chalk from 'chalk';

// should log timestamp on production enviroment
const getTimeStamp = (): string => {
	return new Date().toTimeString().split(' ')[0];
};

const info = (namespace: string, message: string, object?: any): void => {
	console.log(`[INFO] ${getTimeStamp()} [${namespace}] ${message}`, object ?? '');
};

const warn = (namespace: string, message: string, object?: any): void => {
	console.log(getTimeStamp());
	console.warn(`[WARN] ${getTimeStamp()} [${namespace}] ${message}`, object ?? '');
};

const error = (namespace: string, message: string, object?: any): void => {
	console.log(getTimeStamp());
	console.error(`[ERROR] ${getTimeStamp()} [${namespace}] ${message}`, object ?? '');
};

const debug = (namespace: string, message: string, object?: any): void => {
	console.log(getTimeStamp());
	console.log(`[DEBUG] ${getTimeStamp()} [${namespace}] ${message}`, object ?? '');
};

const request = (namespace: string, method: string, url: string, object?: any): void => {
	console.log(`[REQUEST] ${getTimeStamp()} [${namespace}] [${method}]${url}`, object ?? '');
};

const response = (namespace: string, method: string, url: string, status: number, object?: any): void => {
	var statusCodeColored = null;
	if (status >= 500) {
		statusCodeColored = chalk.red(status); // red
	} else if (status >= 400) {
		statusCodeColored = chalk.yellow(status); // yellow
	} else if (status >= 300) {
		statusCodeColored = chalk.cyan(status); // cyan
	} else if (status >= 200) {
		statusCodeColored = chalk.green(status); // green
	}
	console.log(`[RESPONSE] ${getTimeStamp()} [${namespace}] ${statusCodeColored} [${method}]${url}`, object ?? '');
};

export default {
	info,
	warn,
	error,
	debug,
	request,
	response
};
