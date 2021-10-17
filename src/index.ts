import { Reader } from './sheetReader';
import { WebServer } from './webServer';
import { Websocket } from './websocket';

const ws = new Websocket();

const sheet = new Reader(15 * 60 * 1000, ws.update);

const server = new WebServer(sheet);
server.start();
