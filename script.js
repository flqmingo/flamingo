var currentGroup = 0;
var totalGroups = 6;
var totalGroupsForSecret = 0; // 用于存储展示 secret 文件夹照片的组数
var isForTa = false;
var forTaBtn = document.getElementById('forTaBtn');
var rotationSpeed = 0.1;
var requestId;
var currentRotationY = 0;
var audioForTa = document.getElementById('audioForTa');
var audioForMe = document.getElementById('audioForMe');
var volumeSlider = document.getElementById('volumeSlider');
var rotationDirection = 1;
var isRotationPaused = false;
var enlargedImage = null;
var originalTransforms = [];
var settingsButton = document.getElementById('settingsButton');
var settingsDrawer = document.getElementById('settingsDrawer');
var settingsIcon = document.getElementById('settingsIcon');
var isRotatingClockwise = true;
var numImagesPerGroup = 10; // 每组图片数量，默认为 10
var totalImages = 57; // 照片集 1 数量，默认为 57
var totalImagesSecret = 16; // 照片集 2 数量，默认为 16

function init() {
    var obox = document.getElementById('box');
    updateTotalGroups();
    updateTotalGroupsForSecret(); // 更新展示 secret 文件夹照片的组数
    createDivs(numImagesPerGroup);
    var aDiv = obox.getElementsByTagName('div');
    showGroup(currentGroup, aDiv);

    // 尝试自动播放音频
    attemptAutoPlay();

    var sX, nX, desX = 0, tX = 0;

    document.onmousedown = function (e) {
        // 判断鼠标点击的元素是否为滑块或在抽屉栏内
        if (e.target === volumeSlider || settingsDrawer.contains(e.target)) {
            return;
        }
        cancelAnimationFrame(requestId);
        e = e || window.event;
        sX = e.clientX;
        this.onmousemove = function (e) {
            if (settingsDrawer.contains(e.target)) {
                return;
            }
            e = e || window.event;
            nX = e.clientX;
            desX = nX - sX;
            // 根据拖动方向调整旋转方向
            if (desX > 0) {
                rotationDirection = 1;
            } else if (desX < 0) {
                rotationDirection = -1;
            }
            tX += desX * 0.1;
            obox.style.transform = `rotateY(${tX}deg)`;
            currentRotationY = tX;
            sX = nX;
        }
        this.onmouseup = function () {
            this.onmousemove = this.onmouseup = null;
            startAutoRotation();
        }
        return false;
    }

    function mousewheel(obj, fn) {
        document.onmousewheel === null? obj.onmousewheel = fn : addEvent(obj, "DOMMouseScroll", fn)
    }

    function addEvent(obj, eName, fn) {
        obj.attachEvent? obj.attachEvent("on" + eName, fn) : obj.addEventListener(eName, fn);
    }

    mousewheel(document, function (e) {
        e = e || window.event;
        var d = e.wheelDelta / 120 || -e.detail / 3;
        if (d > 0) {
            index -= 20;
        } else {
            index += 30;
        }
        (index < (-1050) && (index = (-1050)));
        document.body.style.perspective = 1000 + index + "px";
    })

    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    prevBtn.addEventListener('click', function () {
        cancelAnimationFrame(requestId);
        if (isForTa) {
            if (currentGroup === 0) {
                currentGroup = totalGroupsForSecret - 1;
            } else {
                currentGroup--;
            }
        } else {
            if (currentGroup === 0) {
                currentGroup = totalGroups - 1;
            } else {
                currentGroup--;
            }
        }
        var aDiv = obox.getElementsByTagName('div');
        showGroup(currentGroup, aDiv);
        startAutoRotation();
    });
    nextBtn.addEventListener('click', function () {
        cancelAnimationFrame(requestId);
        if (isForTa) {
            if (currentGroup === totalGroupsForSecret - 1) {
                currentGroup = 0;
            } else {
                currentGroup++;
            }
        } else {
            if (currentGroup === totalGroups - 1) {
                currentGroup = 0;
            } else {
                currentGroup++;
            }
        }
        var aDiv = obox.getElementsByTagName('div');
        showGroup(currentGroup, aDiv);
        startAutoRotation();
    });

    forTaBtn.addEventListener('click', function () {
        if (isForTa) {
            isForTa = false;
            forTaBtn.textContent = 'For Ta';
            currentGroup = 0;
            var aDiv = obox.getElementsByTagName('div');
            showGroup(currentGroup, aDiv);
            audioForTa.pause();
            audioForMe.currentTime = 0;
            audioForMe.play();
        } else {
            var password = prompt('TA');
            if (password === 'luohong') {
                isForTa = true;
                forTaBtn.textContent = 'For Me';
                currentGroup = 0;
                var aDiv = obox.getElementsByTagName('div');
                showGroup(currentGroup, aDiv);
                audioForMe.pause();
                audioForTa.currentTime = 0;
                audioForTa.play();
            } else {
                alert('验证信息错误');
            }
        }
        // 不重新启动旋转动画
    });

    // 启动自动旋转
    startAutoRotation();

    // 音量调节功能
    volumeSlider.addEventListener('input', function () {
        var volume = parseFloat(this.value);
        if (isForTa) {
            audioForTa.volume = volume;
        } else {
            audioForMe.volume = volume;
        }
    });

    // 设置按钮点击事件
    settingsButton.addEventListener('click', function () {
        settingsDrawer.classList.toggle('open');
        if (isRotatingClockwise) {
            settingsIcon.style.animation = 'rotateClockwise 0.5s linear forwards';
        } else {
            settingsIcon.style.animation = 'rotateCounterclockwise 0.5s linear forwards';
        }
        isRotatingClockwise =!isRotatingClockwise;
    });

    // 监听数字选择器的变化
    var numberSelector1 = document.getElementById('numberSelector1');
    numberSelector1.addEventListener('input', function () {
        numImagesPerGroup = parseInt(this.value);
        updateTotalGroups();
        updateTotalGroupsForSecret(); // 更新展示 secret 文件夹照片的组数
        createDivs(numImagesPerGroup);
        var aDiv = obox.getElementsByTagName('div');
        showGroup(currentGroup, aDiv);
    });

    var numberSelector2 = document.getElementById('numberSelector2');
    numberSelector2.addEventListener('input', function () {
        totalImages = parseInt(this.value);
        updateTotalGroups();
        currentGroup = 0;
        createDivs(numImagesPerGroup);
        var aDiv = obox.getElementsByTagName('div');
        showGroup(currentGroup, aDiv);
    });

    var numberSelector3 = document.getElementById('numberSelector3');
    numberSelector3.addEventListener('input', function () {
        totalImagesSecret = parseInt(this.value);
        updateTotalGroupsForSecret(); // 更新展示 secret 文件夹照片的组数
        currentGroup = 0;
        createDivs(numImagesPerGroup);
        var aDiv = obox.getElementsByTagName('div');
        showGroup(currentGroup, aDiv);
    });
}

// 根据总图片数量和每组图片数量更新总组数
function updateTotalGroups() {
    totalGroups = Math.ceil(totalImages / numImagesPerGroup);
}

// 根据 secret 文件夹照片总数量和每组图片数量更新展示 secret 文件夹照片的总组数
function updateTotalGroupsForSecret() {
    totalGroupsForSecret = Math.ceil(totalImagesSecret / numImagesPerGroup);
}

// 创建指定数量的 div
function createDivs(num) {
    var obox = document.getElementById('box');
    obox.innerHTML = '';
    for (var i = 0; i < num; i++) {
        var div = document.createElement('div');
        obox.appendChild(div);
    }
    var p = document.createElement('p');
    obox.appendChild(p);
}

// 显示指定组的图片
function showGroup(groupIndex, divs) {
    for (var i = 0; i < divs.length; i++) {
        divs[i].style.transition = 'none';
        divs[i].style.transform = 'rotateY(0deg) translate3d(0, 0, 0px)';
    }

    void divs[0].offsetWidth;

    for (var i = 0; i < divs.length; i++) {
        var imgIndex;
        if (isForTa) {
            imgIndex = groupIndex * numImagesPerGroup + i + 1;
            if (imgIndex <= totalImagesSecret) {
                divs[i].style.background = `url(secrets/${imgIndex}.jpg) center/cover`;
            } else {
                divs[i].style.background = 'transparent';
            }
        } else {
            imgIndex = groupIndex * numImagesPerGroup + i + 1;
            if (imgIndex <= totalImages) {
                divs[i].style.background = `url(images/${imgIndex}.jpg) center/cover`;
            } else {
                divs[i].style.background = 'transparent';
            }
        }
    }

    for (var i = 0; i < divs.length; i++) {
        divs[i].style.transition = `transform 1s ${i * 0.1}s`;
        divs[i].style.transform = `rotateY(${i * (360 / divs.length)}deg) translate3d(0, 0, 350px)`;
    }
}

// 启动自动旋转
function startAutoRotation() {
    if (isRotationPaused) return;
    var obox = document.getElementById('box');
    function rotate() {
        currentRotationY += rotationDirection * rotationSpeed;
        currentRotationY = currentRotationY % 360;
        // 直接根据 currentRotationY 重新构建 transform 样式
        obox.style.transform = `rotateY(${currentRotationY}deg)`;
        requestId = requestAnimationFrame(rotate);
    }
    rotate();
}

// 尝试自动播放音频
function attemptAutoPlay() {
    var audioToPlay = isForTa? audioForTa : audioForMe;
    var playPromise = audioToPlay.play();

    if (playPromise!== undefined) {
        playPromise.then(() => {
            // 自动播放成功
        }).catch(() => {
            // 自动播放失败，监听用户交互
            document.addEventListener('click', () => {
                audioToPlay.play();
            }, { once: true });
        });
    }
}

// 页面加载完成后调用 init 函数
window.addEventListener('load', init);