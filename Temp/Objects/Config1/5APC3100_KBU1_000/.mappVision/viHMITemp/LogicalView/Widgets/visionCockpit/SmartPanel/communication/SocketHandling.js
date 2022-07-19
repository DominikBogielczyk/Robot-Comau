/*
 * Socket handling
 *
 */
/*global define*/
define([], function () {
    'use strict';

    function SocketHandling(context, vsEncoder, vsDecoder) {
        this.parent = context;
        this.settings = context.settings;
        this.server = {};
        this.vsDecoder = vsDecoder;
        this.vsEncoder = vsEncoder;
        this.counterSocketErrors = 0;
    }

    var p = SocketHandling.prototype,
        MAX_NUMBER_OF_RECONNECT_REQUESTS = 10, 
        MAPPVISION_HMI_ACTIVE =  0x80000000;


    /**
     *  @brief URL for web socket communication depending on configuration
     *  @return URL for web socket communication depending on configuration
     *  
     *  @details add the parameter &ip=xxx.xxx.xxx.xxx  to your URL to connect to SPS xxx.xxx.xxx.xxx
     */
    p._createWebsocketCommunciationUrl = function () {
        var url,
            spsTargetHost = location.hostname;

        if (this.settings.ipAddress === 'localhost') {
            url = "ws://" + this.settings.ipAddress + ":8082?caller=browser";
        } else {
            if (location.search.includes("&ip")) {
                spsTargetHost = location.search.substr(location.search.indexOf("&ip=") + "&ip=".length); // only allowed at end of URL
                console.warn("**** Websocket will connect to remote host " + spsTargetHost + " instead of standard host " + location.hostname + " ****");
            }
            url = "ws://" + spsTargetHost + ":15080?caller=browser&cam=" + this.settings.ipAddress + ":8082";
        }
        return url;
    };

    p._openSocketCommunication = function () {
        var url;

        if (this.settings.ipAddress === ''){
            return;
        }

        if ((this.server.socket !== undefined) && ((this.server.socket.readyState === this.server.socket.CONNECTING) || (this.server.socket.readyState === this.server.socket.OPEN))) {
            return;
        }
        url = this._createWebsocketCommunciationUrl();
        this.server.socket = new WebSocket(url, "json");

        if (this.vsEncoder !== undefined) {
            this.vsEncoder.setSocket(this.server.socket);
        }
        this.server.socket.addEventListener('open', this.parent._bind(this._socketOpenHandler));
        this.server.socket.addEventListener('close', this.parent._bind(this._socketCloseHandler));
        this.server.socket.addEventListener('message', this.parent._bind(this._socketMessageHandler));
        this.server.socket.addEventListener('error', this.parent._bind(this._socketErrorHandler));

    };

    p.closeSocket = function () {
        if ((this.server !== undefined) && (this.server.socket !== undefined)) {
            this.server.socket.removeEventListener('open', this.parent._bind(this._socketOpenHandler));
            this.server.socket.removeEventListener('close', this.parent._bind(this._socketCloseHandler));
            this.server.socket.removeEventListener('message', this.parent._bind(this._socketMessageHandler));
            this.server.socket.removeEventListener('error', this.parent._bind(this._socketErrorHandler));
            this.server.socket.close();
        }
    };

    p.signalUpdateOfCameraStatus = function () {
        if (this._isCameraReadyForConnection()) {
            this._openSocketCommunication();
        }
    };

    p._socketOpenHandler = function () {
        var socketHandling = this.socketHandling;
        socketHandling.server.numberOfReconnectRequests = 0;
        socketHandling.counterSocketErrors = 0;
        this.onSocketOpen();
    };

    p._socketErrorHandler = function () {
        var socketHandling = this.socketHandling;
        socketHandling.counterSocketErrors = socketHandling.counterSocketErrors + 1;
        if (socketHandling.counterSocketErrors > MAX_NUMBER_OF_RECONNECT_REQUESTS) {
            this.onSocketReconnectFailure();
        }
    };

    p._socketCloseHandler = function () {
        var socketHandling = this.socketHandling;
        this.setInitialComplete(false);
        socketHandling.signalUpdateOfCameraStatus();
    };

    p._socketMessageHandler = function (e) {
        this.vsDecoder.handleMessage(e);
    };
    
    p.isConnectionOpen = function () {
        if (this.server.socket !== undefined) {
            if ((this.server.socket.readyState === this.server.socket.OPEN) || (this.server.socket.readyState === this.server.socket.CONNECTING)) {
                return true;
            } 
        } 
        return false; 
    };

    p._isCameraReadyForConnection = function () {
        if (!this.parent.getVisionApplicationIsLoading() && this.parent.getIsOperationModeSetToHmi() && (this.parent.getImageAcquisitionStatus() === MAPPVISION_HMI_ACTIVE)) {
            return true;
        }
        return false;
    };

    return SocketHandling;
});