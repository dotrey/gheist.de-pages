import qrWrapper from "./qrWrapper.js";
export default class qrGhost {
    constructor() {
        this.videoConstraints = {
            video: {
                facingMode: "environment"
            },
            audio: false
        };
        this.scanning = false;
        this.debug = true;
        this.extendedDebugging = null;
        this.container = document.getElementById("main-container");
        this.infoContainer = document.getElementById("info-container");
        this.videoContainer = document.getElementById("video-container");
        this.errorContainer = document.getElementById("error");
        this.setupDebug();
        this.setupCanvas();
        this.setupResult();
        this.setupVideo();
        this.qr = new qrWrapper(this.displayResult.bind(this));
        this.hideVideo();
        this.setupInfo();
        this.log("initialized");
    }
    displayResult(result) {
        if (!result) {
            this.scan();
            return;
        }
        this.log("display result", result);
        if (result.match(/^[a-z]*?:\/\//i)) {
            this.displayResultUrl(result);
        }
        else {
            this.displayResultGeneral(result);
        }
        if (this.scanning) {
            this.stopScanning();
        }
    }
    displayResultUrl(url) {
        let a = document.createElement("a");
        a.href = url;
        a.innerHTML = url;
        a.target = "_blank";
        this.result.innerHTML = "";
        this.result.appendChild(a);
    }
    displayResultGeneral(result) {
        this.result.innerHTML = result;
    }
    copyResult() {
        let result = this.result.innerText;
        let copySuccess = () => {
            this.result.classList.add("copied");
            window.setTimeout(() => {
                this.result.classList.remove("copied");
            }, 500);
        };
        if (!navigator.clipboard) {
            let ta = document.createElement("textarea");
            ta.setAttribute("style", "position: fixed;");
            ta.value = result;
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand("copy");
                copySuccess();
            }
            catch (err) {
                this.log("copy to clipboard failed");
            }
            document.body.removeChild(ta);
        }
        else {
            navigator.clipboard.writeText(result).then(function () {
                copySuccess();
            }, function (err) {
                this.log("copy to clipboard failed");
            });
        }
    }
    hideVideo() {
        if (this.video.srcObject) {
            this.video.pause();
            this.video.srcObject = null;
        }
        this.videoContainer.style.display = "none";
    }
    showVideo() {
        this.error();
        if (!navigator.mediaDevices) {
            this.log("no media device support");
            return;
        }
        this.videoContainer.style.display = "block";
        navigator.mediaDevices.getUserMedia(this.videoConstraints)
            .then((stream) => {
            this.log("video stream found (" + stream.id + ")");
            stream.onremovetrack = (ev) => {
                this.log("video stream ended");
            };
            this.video.srcObject = stream;
        })
            .catch((error) => {
            if (error.name === "ConstraintNotSatisfiedError" ||
                error.name === "OverconstrainedError") {
                this.error("No video stream available for specified constraints.", this.videoConstraints);
            }
            else if (error.name === "PermissionDeniedError" ||
                error.name === "NotAllowedError") {
                this.error("Permission to access camera is required.");
            }
            else {
                this.error("Error while accessing video stream.", error);
            }
            this.hideVideo();
        });
    }
    startScanning() {
        let context = this.canvas.getContext("2d");
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.scanning = true;
        this.scan();
        this.log("start scan...");
    }
    scan() {
        if (!this.scanning || this.video.paused || this.video.ended) {
            this.log("... not scanning, video paused or ended");
            return;
        }
        this.qr.decodeVideo(this.canvas, this.video);
    }
    stopScanning() {
        this.scanning = false;
        this.hideVideo();
        this.log("stopped scan");
    }
    adjustVideoSize() {
        this.video.width = this.videoContainer.offsetWidth;
        let adjust = (time) => {
            console.log("offsetWidth " + this.video.offsetWidth);
            console.log("offsetHeight " + this.video.offsetHeight);
            console.log("width " + this.video.width);
            if (this.video.offsetWidth !== this.video.width) {
                console.log("-> retry");
                window.requestAnimationFrame(adjust);
                return;
            }
            if (this.video.offsetHeight < this.videoContainer.offsetWidth) {
                this.video.width = Math.ceil((this.video.width / this.video.offsetHeight) * this.video.width);
                this.log("new width " + this.video.width);
            }
        };
        window.requestAnimationFrame(adjust);
    }
    setupCanvas() {
        this.canvas = document.getElementById("qr-image");
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    setupInfo() {
        let show = document.getElementById("show-info-button");
        this.addClickListener(show, (e) => {
            this.infoContainer.style.display = "block";
        });
        let hide = document.getElementById("hide-info-button");
        this.addClickListener(hide, (e) => {
            this.infoContainer.style.display = "none";
        });
        window.addEventListener("load", () => {
            window.setTimeout(() => {
                this.infoContainer.style.display = "none";
            }, 500);
        });
    }
    setupResult() {
        let btn = document.getElementById("scan-button");
        this.addClickListener(btn, (e) => {
            this.showVideo();
            this.log("touch scan");
        });
        this.addClickListener(btn, (e) => {
            this.showVideo();
            this.log("click scan");
        });
        let copy = document.getElementById("copy-button");
        this.addClickListener(copy, (e) => {
            this.copyResult();
        });
        this.result = document.getElementById("qr-result");
    }
    setupVideo() {
        this.video = document.getElementById("qr-video");
        this.video.addEventListener("play", (e) => {
            this.log("playing");
            this.startScanning();
        });
        this.video.addEventListener("resize", (e) => {
            this.log("resize");
            this.adjustVideoSize();
        });
        this.video.addEventListener("loadedmetadata", (e) => {
            this.video.play();
        });
        let cancel = this.videoContainer.querySelector(".cancel");
        this.addClickListener(cancel, (e) => {
            this.hideVideo();
            this.log("touch cancel");
        });
        this.addClickListener(cancel, (e) => {
            this.hideVideo();
            this.log("click cancel");
        });
        this.detectVideoDevices();
    }
    detectVideoDevices() {
        let constraints = navigator.mediaDevices.getSupportedConstraints();
        this.log("supported media constraints", constraints);
        this.log("devices:");
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            for (let device of devices) {
                this.log("- " + device.kind + " : " + device.label + " | id: " + device.deviceId);
            }
        })
            .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });
    }
    setupDebug() {
        if (location.search === "?debug") {
            this.extendedDebugging = document.createElement("textarea");
            this.extendedDebugging.classList.add("debug-area");
            document.body.appendChild(this.extendedDebugging);
        }
    }
    addClickListener(element, handler) {
        element.addEventListener("touchstart", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            handler(e);
        });
        element.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            handler(e);
        });
    }
    error(msg, o) {
        this.errorContainer.innerHTML = msg || "";
        if (!msg) {
            return;
        }
        this.log(msg, o);
    }
    log(msg, o) {
        if (!this.debug) {
            return;
        }
        console.log("qr ghost >> " + msg);
        if (o) {
            console.log(o);
        }
        if (this.extendedDebugging) {
            this.extendedDebugging.value += "\n" + msg;
            if (o) {
                this.extendedDebugging.value += "\nOBJECT: " + o;
                for (let prop of Object.getOwnPropertyNames(o)) {
                    this.extendedDebugging.value += "\n " + prop + " : " + o[prop];
                }
            }
            this.extendedDebugging.scrollTop = this.extendedDebugging.scrollHeight;
        }
    }
    demoQrCode(file = "/assets/img/demo/qr-url.png") {
        this.qr.decodeImage(file, this.canvas);
    }
}
//# sourceMappingURL=qrGhost.js.map