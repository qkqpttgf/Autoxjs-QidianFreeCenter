
var closeButtonBottom = 220; // 新广告右上角的X的下沿高度，控制台也放这么高
// 如果在你手机上控制台跟广告的X高度距离太远，请修改这个，因为会影响模拟扫描循环点击X；
var t_click_step = 10;      // 循环扫描点击时，每步移这么远再点下一次
var t_click_x_left = 100;   // 循环扫描点击区域的左边框，到屏幕右边的距离
var t_click_x_right = 20;   // 循环扫描点击区域的右边框，到屏幕右边的距离
var t_click_y_top = 30;     // 循环扫描点击区域的上边框，在closeButtonBottom上方这么多
var t_click_y_bottom = 20;  // 循环扫描点击区域的下边框，在closeButtonBottom下方这么多
var t_click = new Object(); // 用于存储扫描点击成功的坐标

//storages.remove("ysun.QidianFreeCenter");
var storage = storages.create("ysun.QidianFreeCenter");
var closeCoord_name = "closeCoord";
let tmp = storage.get(closeCoord_name);
if (tmp) t_click = JSON.parse(tmp);
var longdash = "———————";
var freeCenterScrolled = 0;

//setScreenMetrics(1080, 2310);
console.show();
auto.waitFor();
console.setTitle("起点自动20251102");
var c_pos = [[0, closeButtonBottom], [device.width / 2, device.height - 500]]; // 控制台位置切换
console.setPosition(c_pos[0][0], c_pos[0][1]); // 控制台放上半，方便对比closeButtonBottom高度
console.setSize(device.width / 2, device.width / 2);

if (auto.service == null) {
    console.error("请先开启无障碍服务！");
    exit();
}
console.info("无障碍服务已开启");
//log("开启静音");
//device.setMusicVolume(0); // 要给autojs权限
if (!requestScreenCapture()) {
    console.error("请求截图权限 失败");
    console.verbose("退出脚本");
    exit();
}
toastLog("请求截图权限 成功");
try {
    if (paddle) console.log("有Paddle识别功能");
} catch (error) {
    console.error("无Paddle识别功能，请先安装Autox.js v7！");
    exit();
}
console.log(longdash);

function openQidian() {
    launch("com.qidian.QDReader");
    waitForPackage("com.qidian.QDReader");

    function t() {
        if (id("imgClose").exists()) {
            console.verbose("首页悬浮广告");
            sleep(500);
            id("imgClose").findOne(500).click();
        }
        if (textContains("青少年模式").exists && textContains("青少年模式").findOne(500)) {
            console.verbose("青少年模式");
            sleep(500);
            click("我知道了", 0);
        }
    }
    let n = 0;
    do {
        n++;
        let a = currentActivity();
        if (a == "com.qidian.QDReader.ui.activity.SplashADActivity") {
            console.verbose("开屏广告");
        } else if (a == "com.qidian.QDReader.ui.activity.QDReaderActivity") {
            console.verbose("阅读界面");
            back();
        } else if (a.indexOf("com.qidian.QDReader.ui.activity.chapter") > -1) {
            console.verbose("本章说");
            back();
        } else if (a.indexOf("com.qidian.QDReader.ui.activity.new_msg") > -1) {
            console.verbose("消息中心");
            back();
        } else if (wherePage() == "freecenter") {
            console.verbose("福利中心");
            back();
        } else {
            console.verbose("缓冲……");
        }
        sleep(1000);
        t();
        if (n > 15 && currentPackage() != "com.qidian.QDReader") break;
    } while (wherePage() != "index");
    sleep(600);
    t();
    back(); // 有时启动后会在 精选 页
    sleep(600);
    t();
    sleep(600);
    if (wherePage() != "index") {
        console.warn(wherePage(), currentPackage(), currentActivity());
        console.error("似乎未识别到起点首页，请清理进程重新来一遍");
        exit();
    }
    swipe(device.width - 50, device.height / 2, device.width - 60, device.height / 2 + 200, 500);

    console.info("起点已启动成功");
}
function enterFreeCenter() {
    if (wherePage() != "index") openQidian();
    sleep(1000);

    if (text("签到").exists()) {
        click("签到", 0);
        console.info("签到");
        sleep(2000);
    }
    if (wherePage() != "index") {
        // 周日兑换直接打开
        console.log("周日直接跳转");
        let m = 0;
        while (m < 15 && wherePage() != "freecenter") {
            m++;
            console.verbose("缓冲");
            sleep(1000);
        }
    } else if (text("领福利").exists()) {
        log("有“领福利”按钮");
        click("领福利", 0);
    } else {
        let uc = id("viewPager").className("androidx.viewpager.widget.ViewPager").scrollable(true).findOne(1000);
        let uc1 = id("view_tab_title_title").className("android.widget.TextView").text("我").findOne(1000);
        if (uc1 && uc1.parent().clickable()) {
            //方案一.1
            uc1.parent().click();
        } else if (uc1 && uc1.parent().parent().clickable()) {
            //方案一.2
            uc1.parent().parent().click();
        } else if (uc) {
            //方案二
            let x1 = uc.bounds().right;
            let y1 = uc.bounds().bottom;
            click((x1 - 10), (y1 + 10));
        } else {
            //方案三
            click(device.width - 100, device.height - 100);
        }
        sleep(3000);
        if (!text("福利中心").exists()) {
            console.warn(wherePage(), currentPackage(), currentActivity());
            console.warn("没有“福利中心”字样，似乎未成功打开“我”");
            exit();
        }
        log("成功打开“我”");
        click("福利中心", 0);
    }
    let m = 0;
    while (m < 15 && wherePage() != "freecenter") {
        console.verbose("缓冲中……");
        sleep(1000);
        m++;
    }

    if (wherePage() != "freecenter") {
        console.warn(wherePage(), currentPackage(), currentActivity());
        console.error("没识别到福利中心");
        exit();
    }
    console.info("已进入福利中心");
}
function lottery() {
    let result = 0;
    let cb = className("android.widget.TextView").textContains("抽奖机会 ×").findOne(500);
    let j = false;
    if (!cb) {
        let e = className("android.widget.ListView").findOne(500);
        if (e.parent().clickable) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, e);
            e.parent().click();
            j = true;
            console.verbose("点进签到日历");
            sleep(2000);
            scrollShowButton(device.height, 0); // 进入后它会自动向下滚，滚回
        }
        sleep(1000);
        cb = className("android.widget.TextView").textContains("抽奖机会 ×").findOne(500);
    }
    if (cb) {
        // 有抽奖机会
        console.verbose(cb.text());
        if (j) scrollShowButton(0, cb);
        else freeCenterScrolled = scrollShowButton(freeCenterScrolled, cb);
        cb.click();
        sleep(1000);
        let c = null;
        while (c = className("android.widget.TextView").text("抽奖").findOne(500)) {
            log(c.text());
            c.click();
            result = 1;
            sleep(5000);
        }
        className("android.widget.TextView").text("").findOne(500).click(); // 关闭
    } else {
        let d = className("android.widget.Button").text("去兑换 今日").findOne(500);
        if (d) {
            // 今日有周日兑换
            console.verbose(d.text());
            d.click();
            sleep(2000);
            let num = [30, 20, 15]; // 按钮对应碎片数量
            for (let n = 0; n < num.length; n++) {
                let d1 = className("android.widget.TextView").text("".concat(num[n]) + "张碎片兑换").findOne(500);
                if (d1) {
                    let p1 = d1.parent().children();
                    for (let i = 0; i < p1.length; i++) {
                        if (p1[i].clickable() && p1[i].text() == "兑换") {
                            console.log(d1.text());
                            p1[i].click();
                            result = 2;
                            sleep(1000);
                            className("android.widget.Button").text("兑换").findOne(500).click();
                            sleep(2000);
                        }
                    }
                }
            }
        }
    }
    if (j) {
        back();
        sleep(2000);
    }
    return result;
}
function video_look() {
    if (textContains("播放将消耗流量").exists()) {
        click("继续播放", 0);
    }
    //判断是否进入视频播放页面
    let ad_raw = -1, ad_clicknewpage = -1; // 生页面、 要再点击一下的页面
    let m = 0;
    do {
        console.verbose("缓冲……");
        sleep(1000);
        if (textContains("验证").exists()) {
            let c1 = 0;
            while (textContains("验证").exists()) {
                c1++;
                console.setPosition(c_pos[c1 % 2][0], c_pos[c1 % 2][1]);
                toastLog("请手动过一下验证");
                sleep(2000);
            }
            if (c1 > 0) console.setPosition(c_pos[0][0], c_pos[0][1]);
        }
        m++;
        if (m > 2) {
            //    console.verbose("尝试截图OCR");
            let capimg = captureScreen();
            //capimg = images.clip(capimg, 0, 0, device.width, closeButtonBottom);
            let res = paddle.ocr(capimg);
            for (let i = 0; i < res.length; i++) {
                if (res[i].text.indexOf("可获得奖励") > -1) {
                    //log(i, res[i].text);
                    let sec = res[i].text.replace(/[^\d]/g, "");
                    if (res[i].text.indexOf("点击广告") > -1) {
                        console.log("点击：", sec);
                        ad_clicknewpage = sec * 1;
                        break;
                    } else if (res[i].text.indexOf("浏览") > -1) {
                        console.log("浏览：", sec);
                        ad_raw = sec * 1;
                        break;
                    } else if (res[i].text.indexOf("观看") > -1) {
                        // 冰雪游戏广告
                        console.log("观看：", sec);
                        ad_raw = sec * 1;
                        break;
                    }
                }
                if (res[i].text.indexOf("已经获得奖励") > -1 || res[i].text.indexOf("已获得奖励") > -1) {
                    console.log("已获得");
                    ad_raw = 1;
                    break;
                }
            }
            if (ad_raw > -1) break;
            if (ad_clicknewpage > -1) break;
        }
        if (m > 15) {
            console.warn("似乎哪里不对");
            break;
        }
    } while (!(textContains("可获得奖励").exists() || className("android.view.View").textContains("可获得奖励").exists() || className("android.widget.TextView").textContains("跳过").exists()));// || className("android.view.ViewGroup").find().length > 30

    if (className("android.widget.TextView").textContains("跳过").exists()) {
        let thread1 = threads.start(
            function t() {
                sleep(1000);
                if (!className("android.widget.TextView").textContains("跳过").exists()) {
                    thread1.interrupt();
                    m = 0;
                    log("“跳过”2字没了");
                }
            }
        );
    }
    if (ad_raw > -1 || ad_clicknewpage > -1) {
        // 新广告
        let sec = ad_clicknewpage;
        if (sec == -1) sec = ad_raw;
        do {
            let capimg = captureScreen();
            let res = paddle.ocr(capimg);
            let sec1 = -1;
            for (let i = 0; i < res.length; i++) {
                if (res[i].text.indexOf("可获得奖励") > -1) {
                    sec1 = res[i].text.replace(/[^\d]/g, "") * 1;
                    break;
                }
            }
            if (sec1 > -1) sec = sec1;
            else sec = 0;

            for (let i = 0; i < res.length; i++) {
                if (res[i].text.indexOf("点击") > -1) {
                    // 要点击广告的，额外点击一下
                    let b = res[i].bounds;
                    click(parseInt((b.left + b.right) / 2), parseInt((b.top + b.bottom) / 2));
                }
            }
            if (sec > 0) {
                let m1 = 0;
                while (m1 < sec + 1) {
                    sleep(1000);
                    m1++;
                    //console.verbose("等待", m1);
                }
                console.log("已过" + sec + "秒");
            }

            // currentActivity()
            if (currentPackage() != "com.qidian.QDReader") {
                // 如果当前不在起点，应该是点击跳出去了，先直接切换回起点
                console.verbose(currentPackage());
                launch("com.qidian.QDReader");
                sleep(1000);
            }
            sleep(1000);
        } while (sec > 0);
        console.log("应该已获得奖励");

        // 看完点X
        let n = 0;
        let try_back_time = 2;
        let xr = device.width - t_click_x_right, yt = closeButtonBottom - t_click_y_top;
        let xc = xr, yc = yt;
        do {
            n++;
            if (currentPackage() != "com.qidian.QDReader") {
                // 如果当前不在起点，先直接切换回起点
                console.verbose(currentPackage());
                launch("com.qidian.QDReader");
                sleep(1000);
            }

            if (n < try_back_time + 1) {
                console.verbose("尝试模拟“手势返回”");
                back();
            } else {
                let n1 = n - try_back_time - 1;
                if (n1 < Object.keys(t_click).length) {
                    let tmp = t_click[Object.keys(t_click)[n1]];
                    console.verbose("尝试点击", tmp.x, tmp.y);
                    click(tmp.x, tmp.y);
                } else {
                    if (xc < device.width - t_click_x_left) {
                        console.error("没点到，放弃");
                        console.warn("请编辑代码前几行，扩大循环点击扫描的范围，试出点击坐标后，再缩小范围。");
                        exit();
                    }
                    console.verbose("扫描", xc, yc);
                    click(xc, yc);
                    yc += t_click_step;
                    if (yc > closeButtonBottom + t_click_y_bottom) {
                        yc = yt;
                        xc -= t_click_step;
                    }
                }
            }
            sleep(1000);
        } while (wherePage() != "freecenter");

        if (!(xc == xr && yc == yt)) {
            yc -= t_click_step;
            if (yc < yt) {
                yc = closeButtonBottom + t_click_y_bottom;
                xc += t_click_step;
            }
            let tmp = new Object();
            tmp.x = xc;
            tmp.y = yc;
            t_click["" + xc + "," + yc] = tmp;
        }
    } else {
        // 旧广告，用旧方法
        //获取退出坐标
        let video_quit = null;
        let x1 = 1, x2 = 1, y1 = 1, y2 = 1;
        let thread = threads.start(
            function coordinate() {
                sleep(3000);
                if (textContains("可获得奖励").exists() && !video_quit) {
                    video_quit = textContains("可获得奖励").findOne(500).bounds();
                    x1 = 0;
                    x2 = video_quit.left;
                    y1 = video_quit.top;
                    y2 = video_quit.bottom;
                    console.verbose("退出坐标", parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2));
                } else {
                    console.verbose("计算退出坐标失败，稍后重新获取");
                    return;
                }
            }
        );
        let m1 = 0;
        let video_flag = ""; //视频文字信息
        //判断视频是否播放到满足领取奖励条件
        let v = -1;
        do {
            if (textContains("获得奖励").exists()) {
                /* if (textContains("观看完视频").exists()) {
                     video_flag = "观看完视频,可获得奖励";
                 }
                 if (textContains("观看视频").exists()) {
                     video_flag = textContains("观看视频").findOne(500).text();
                 }*/
                video_flag = textContains("获得奖励").findOne(500).text();
                if (textContains("有声书").exists()) {
                    video_flag = textContains("有声书").findOne(500).text();
                }
                let v1 = video_flag.replace(/[^\d]/g, "") * 1;
                if (v1 != v) {
                    console.verbose(video_flag);
                    if (v1 == 0) {
                        log('结束');
                        sleep(1200);
                        break;
                    } else {
                        v = v1;
                    }
                }
            } else if (video_flag.includes("观看完视频")) {
                console.log("看完结束");
                sleep(1100);
                break;
            } else {
                sleep(1000);
                m1++;
            }

            if (textContains("继续观看").exists()) {
                textContains("继续观看").click();
                sleep(1500);
            }
            if (textContains("继续听完").exists()) {
                textContains("继续听完").click();
                sleep(1500);
            }
            if (m1 > 20) {
                console.log("已看20秒");
                break;
            }
        } while (!(video_flag.includes("已") || m == 0));
        log("应该已获得奖励");
        thread.interrupt();

        //退出视频
        let n = 0;
        do {
            n++;
            if (n == 1) {
                click(parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2));
            } else if (textContains("可获得奖励").exists()) {
                log("退出失败，重新获取退出坐标");
                if (textContains("跳过").exists()) {
                    textContains("跳过").findOne(500).click();
                } else {
                    if (textContains("可获得奖励").exists()) {
                        video_quit = textContains("可获得奖励").findOne(500).bounds();
                    }
                    x1 = 0;
                    x2 = video_quit.left;
                    y1 = video_quit.top;
                    y2 = video_quit.bottom;
                    do {
                        let x = random(x1, x2);
                        let y = random(y1, y2);
                        console.verbose("区域随机点击", x, y);
                        click(x, y);
                        if (textContains("继续观看").exists()) {
                            textContains("继续观看").click();
                            sleep(1500);
                        }
                        if (textContains("继续听完").exists()) {
                            textContains("继续听完").click();
                            sleep(1500);
                        }
                    } while (textContains("可获得奖励").exists());
                }
            } else if (n < 5) {
                console.verbose("尝试模拟“手势返回”");
                back();
            } else {
                log("未知原因退出失败，脚本停止运行");
                exit();
            }
            sleep(1000);
        } while (wherePage() != "freecenter");
    }
    sleep(1000);
    clickIknown();
}
function game_play(min) {
    second = min * 60;
    swipe(device.width - 50, device.height / 3, device.width - 55, device.height / 2, 900);
    let num = 0;
    let thread = threads.start(
        function timer1() {
            //计时
            do {
                sleep(1000);
                num++;
            } while (num < 15);
            console.error("没成功获取到游戏中心");
        }
    );
    do {
        console.verbose("缓冲……");
        sleep(1000);
        if (num >= 15) return 1;
    } while (wherePage() != "gamecenter" && wherePage() != "browser");
    thread.interrupt();
    if (wherePage() == "gamecenter") {
        console.info("成功打开游戏中心");
        sleep(1000);
        if (text("在线玩").find().length < 2) {
            console.warn("未识别到“在线玩”");
            return 1;
        }
        let play_btn = text("在线玩").findOnce(0);
        scrollShowButton(0, play_btn);
        play_btn.click();
        log("在线玩");
        sleep(2000);
    }
    if (wherePage() == "browser") console.info("应该打开游戏了");
    console.verbose(longdash);
    sleep(1000);

    do {
        if (textContains("实名认证").exists()) {
            //身份信息仅用于实名认证使用
            console.warn("似乎有实名认证，请先自行认证");
            sleep(2000);
            back();
            return 2;
        }
        if (second % 60 == 0) {
            console.verbose("倒计时" + (second / 60) + "分钟");
        }
        if (second % 10 == 0) {
            click(random(10, 20), random(10, 20));
        }
        sleep(1000);
        second--;
    } while (second > -5);
    log("游戏时间到");
    do {
        back();
        sleep(600);
    } while (wherePage() == "");
    return 0;
}
function wherePage() {
    /* 用current判断就会出事
    if (currentPackage() != "com.qidian.QDReader") {
        // 不在起点APP
        console.verbose(currentPackage());
        return "isNotQidain";
    }
    if (currentActivity() == "com.qidian.QDReader.ui.activity.MainGroupActivity") {
        return "index";
    }*/
    if (text("书架").exists() && text("精选").exists() && text("发现").exists() && text("我").exists()) {
        // 首页或精选或我
        return "index";
    }
    // com.qidian.QDReader.ui.activity.QDBrowserActivity 可能是福利中心也可能是游戏中心
    if (text("完成任务得奖励").exists() || text("激励任务").exists()) {
        // 福利中心
        return "freecenter"
    }
    if (text("阅游戏").exists() && text("在线玩").exists()) {
        // 游戏中心
        return "gamecenter";
    }
    if (id("browser_container").exists()) {
        // 网页，可能是游戏
        return "browser";
    }
    if (textContains("无响应").exists() && text("确定").exists()) {
        click("确定", 0);
    }
    return "";
}
function textButtonExist(str) {
    if (Array.isArray(str)) {
        for (let i = 0; i < str.length; i++) {
            if (text(str[i]).exists()) return true;
        }
    }
    if (typeof str === 'string') {
        if (text(str).exists()) return true;
    }
    return false;
}
function scrollShowButton(scrolled, btn) {
    let btn_top = 0;
    if (typeof btn === "number" && !isNaN(btn)) btn_top = btn;
    else btn_top = btn.bounds().top;
    //log(scrolled, btn_top);
    let h4 = device.height / 4;
    let scroll1 = btn_top - scrolled - device.height * 3 / 4;
    if (scroll1 > device.height / 8) {
        let scroll2 = scroll1;
        for (let i = 0; i < Math.floor(scroll1 / h4); i++) {
            swipe(device.width - 50, device.height * 7 / 8, device.width - 60, device.height * 7 / 8 - h4, 300);
            sleep(100);
            scroll2 -= h4;
        }
        swipe(device.width - 50, device.height * 7 / 8, device.width - 60, device.height * 7 / 8 - scroll2, 500);
        sleep(800);
        return scrolled + scroll1;
    }
    if (scrolled > 0 && btn_top - scrolled < 0) {
        scroll1 = scrolled - btn_top;
        let scroll2 = scroll1;
        for (let i = 0; i < Math.floor(scroll1 / h4); i++) {
            swipe(device.width - 50, device.height / 4, device.width - 60, device.height / 4 + h4, 300);
            sleep(100);
            scroll2 -= h4;
        }
        swipe(device.width - 50, device.height / 4, device.width - 60, device.height / 4 + scroll2, 500);
        sleep(800);
        return scrolled - scroll1;
    }
    return scrolled;
}
function findIndexInParent(d) {
    let p = d.parent();
    if (!p) return -1;
    let c = p.children();
    for (let i = 0; i < c.length; i++) {
        if (c[i].equals(d)) return i;
    }
    return -1;
}
function getTextOfView(v) {
    if (v.childCount() > 1) {
        let t = "";
        let v1 = v.children();
        for (let i = 0; i < v1.length; i++) {
            t += "\n" + getTextOfView(v1[i]);
        }
        if (t.length > 1) t = t.substring(1);
        if (t.substring(t.length - 1) == "\n") t = t.substring(0, t.length - 1);
        return t;
    } else {
        return v.text();
    }
}
function getDescriptionOnLeft(b) {
    let j = findIndexInParent(b);
    if (j > 0) {
        let tmp = b.parent().child(j - 1).children();
        return [getTextOfView(tmp[0]), getTextOfView(tmp[1])];
    }
    return null;
}
function clickIknown() {
    if (textContains("知道了").exists()) {
        textContains("知道了").click();
        //click("知道了", 0);
        sleep(1000);
    }
}

// 正式开始------------------------------------------------------------------
home();
sleep(500);

// 打开起点
openQidian();
console.log(longdash);
sleep(1500);

// 进入福利中心
enterFreeCenter();
console.log(longdash);
sleep(2000);

// 签到里面的抽奖、兑换
console.log("开始抽奖");
let result = lottery();
if (result == 1) console.info("抽奖完成");
else if (result == 2) console.info("兑换完成");
else console.log("无抽奖");
console.log(longdash);
sleep(2000);

// 开始看广告
log("开始看广告");
let targets = ["看视频", "去完成"]; // 目标按钮字符
let expstring = ["白泽宇航员", "玩游戏", "更新提醒", "推送通知", "充值", "携程"]; // 目标按钮左边如果有这些字，跳过
let viewADnum = 0;
do {
    let targetNum = 0, targetFalse = 0;
    for (let i = 0; i < targets.length; i++) {
        let target = targets[i];
        if (text(target).exists()) {
            let aa = text(target).find();
            targetNum += aa.length;
            for (let ii = 0; ii < aa.length; ii++) {
                freeCenterScrolled = scrollShowButton(freeCenterScrolled, aa[ii]);
                //console.verbose(target);
                let f = false;
                let s = getDescriptionOnLeft(aa[ii]);
                if (s) {
                    let s1 = s.join("\n");
                    // 其实感觉这样判断可能以后会有隐患，或许以前用坐标高度不会出错
                    expstring.forEach(e => {
                        if (s1.indexOf(e) > -1) f = true;
                    });
                }
                if (f) {
                    targetFalse++;
                } else {
                    console.verbose(longdash);
                    viewADnum++;
                    console.verbose("广告", viewADnum);
                    console.log(s[0]);
                    console.verbose(s[1]);
                    aa[ii].click();
                    sleep(2000);
                    if (text("可从这里回到福利页哦").exists()) click("我知道了", 0);
                    video_look();
                    console.verbose("退出广告", viewADnum);
                    sleep(1000);
                    break; // 不然会先按下面的，刚刚按过现在又亮起来的会下次循环按
                }
            }
        }
    }
    if (targetFalse == targetNum) break;
} while (textButtonExist(targets));
if (Object.keys(t_click).length > 0) storage.put(closeCoord_name, JSON.stringify(t_click));
if (viewADnum > 0) {
    console.verbose(longdash);
    console.info("看广告结束");
    console.verbose("本次共看", viewADnum, "个广告");
} else {
    console.log("无广告");
}
console.log(longdash);
sleep(2000);

// 其它脚本里的听书等活动，快一年了还没有，先删

// 玩游戏
let gamebtntext = "去完成"; // 按钮字符
let gameremain = "再玩"; // 有这个字符，进入玩游戏
if (textContains(gameremain).exists()) {
    log("开始玩游戏");
    let num = 0;
    do {
        if (num > 5) {
            console.error("已经循环5次了，可能哪里判定不太对，先退出");
            break;
        }
        let b = null;
        let aa = text(gamebtntext).find();
        for (let i = 0; i < aa.length; i++) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, aa[i]);
            let s = getDescriptionOnLeft(aa[i]).join("\n");
            if (s.indexOf(gameremain) > -1) {
                b = aa[i];
                break;
            }
        }
        if (b != null) {
            let playLabel = textContains(gameremain).findOne(500);
            log(playLabel.text());
            let min = playLabel.text().replace(/[^\d]/g, "");
            b.click();
            sleep(5000);
            let res = game_play(min);
            sleep(2000);
            if (wherePage() == "gamecenter") back();
            sleep(3000);
            if (res != 0) break;
        } else {
            console.error("没找到对应的“" + gamebtntext + "”按钮，可能起点改了布局或按钮字符");
        }
        num++;
        sleep(1000);
    } while (textContains(gameremain).exists());
    console.info("结束玩游戏");
    console.log(longdash);
    sleep(1000);
}

// 领游戏与看书时长的
console.log("有无漏领");
let bonusButtonTexts = ["领奖励", "领积分"];
let bonusNum = 0;
bonusButtonTexts.forEach(btnt => {
    if (text(btnt).exists()) {
        let btn = text(btnt).find();
        for (let i = 0; i < btn.length; i++) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, btn[i]);
            let d = getDescriptionOnLeft(btn[i]);
            console.verbose(d[0]);
            btn[i].click();
            bonusNum++;
            sleep(2000);
            clickIknown();
            let d1 = getDescriptionOnLeft(btn[i]);
            console.log(d1[1]);
        }
    }
});
if (bonusNum == 0) console.log("无");
console.log(longdash);
sleep(1000);

console.info("脚本已结束");
log("记得清理auto.js后台");
console.verbose("控制台3秒后自动关闭");
sleep(3000);
console.hide();
engines.stopAllAndToast();
