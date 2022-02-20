import chalk from 'chalk';
import moment from 'moment-timezone';
import config from './config';

// should log timestamp on production enviroment
const getTimeStamp = (): string => {
	return chalk.grey(moment().format("LTS"));
};

const info = (namespace: string, message: any, object?: any): void => {
	console.log(`[${chalk.magenta('INFO')}] ${getTimeStamp()} [${namespace}]`, message ?? '', object ?? '');
};

const warn = (namespace: string, message: any, object?: any): void => {
	console.warn(`[${chalk.yellow('WARN')}] ${getTimeStamp()} [${namespace}]`, message ?? '', object ?? '');
};

const error = (namespace: string, message: any, object?: any): void => {
	console.error(`[${chalk.red('ERROR')}] ${getTimeStamp()} [${namespace}]`, message ?? '', object ?? '');
};

const debug = (namespace: string, message: any, object?: any): void => {
	if (config.enviroment === 'development') {
		console.log(`[${chalk.blue('DEBUG')}] ${getTimeStamp()} [${namespace}]`, message ?? '', object ?? '');
	}
};

const request = (namespace: string, method: string, url: string, object?: any): void => {
	console.log(`[${chalk.yellowBright('REQUEST')}] ${getTimeStamp()} [${namespace}] [${method}]${url}`, object ?? '');
};

const response = (namespace: string, method: string, url: string, status: number, object?: any): void => {
	var colored: (text: string | number) => string;
	if (status >= 500) {
		colored = chalk.red; // red
	} else if (status >= 400) {
		colored = chalk.redBright; // orange
	} else if (status >= 300) {
		colored = chalk.cyan; // cyan
	} else if (status >= 200) {
		colored = chalk.green; // green
	} else {
		colored = chalk.gray;
	}
	console.log(`[${colored('RESPONSE')}] ${getTimeStamp()} [${namespace}] ${colored(status)} [${method}]${url}`, object ?? '');
};

export default {
	info,
	warn,
	error,
	debug,
	request,
	response,
};
