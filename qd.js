
var logFile = false; // 是否将日志保存到文件中

var closeButtonBottom = 200; // 新广告右上角的X的下沿高度，控制台也放这么高
// 如果在你手机上控制台跟广告的X高度距离太远，请修改这个，因为会影响模拟扫描循环点击X；
var t_click_step = 10;      // 循环扫描点击时，每步移这么远再点下一次
var t_click_x_left = 100;   // 循环扫描点击区域的左边框，到屏幕右边的距离
var t_click_x_right = 20;   // 循环扫描点击区域的右边框，到屏幕右边的距离
var t_click_y_top = 30;     // 循环扫描点击区域的上边框，在closeButtonBottom上方这么多
var t_click_y_bottom = 40;  // 循环扫描点击区域的下边框，在closeButtonBottom下方这么多

var t_click = new Object(); // 用于存储扫描点击成功的坐标
var debug = false; // 开启debug循环
//setScreenMetrics(1080, 2310);
console.show();
auto.waitFor();
console.setTitle("20251111起点自动");
var c_pos = [[0, closeButtonBottom], [device.width / 2, device.height - 500]]; // 控制台位置切换
console.setPosition(c_pos[0][0], c_pos[0][1]); // 控制台放上半，方便对比closeButtonBottom高度
console.setSize(device.width / 2, device.width / 2);

var thisLable = "ysun.QidianFreeCenter";
//storages.remove(thisLable);
var storage = storages.create(thisLable);
var closeCoord_name = "closeCoord";
let tmp = storage.get(closeCoord_name);
if (tmp) t_click = JSON.parse(tmp);
var qidianPackageName = "com.qidian.QDReader";
var longdash = "——————————";
var freeCenterScrolled = 0;
var logFilePath = files.cwd() + "/log/" + thisLable + "/";
if (logFile || debug) files.createWithDirs(logFilePath);

l_log("\n\n");
if (auto.service == null) {
    l_error("请先开启无障碍服务！");
    l_exit();
}
l_info("无障碍服务已开启");
//log("开启静音");
//device.setMusicVolume(0); // 要给autojs权限
if (!requestScreenCapture()) {
    l_error("请求截图权限失败");
    l_exit();
}
l_log("请求截图权限成功");
try {
    if (paddle) l_log("有Paddle识图功能");
} catch (error) {
    l_error("无Paddle识图功能，推荐安装Autox.js v7！");
    l_exit();
}
l_log(longdash);

function openQidian() {
    launch(qidianPackageName);
    waitForPackage(qidianPackageName);

    function t() {
        if (id("imgClose").exists()) {
            l_verbose("首页悬浮广告");
            sleep(500);
            id("imgClose").findOne(500).click();
        }
        if (id("upgrade_dialog_close_btn").exists()) {
            l_verbose("升级提醒");
            sleep(500);
            id("upgrade_dialog_close_btn").findOne(500).click();
        }
        if (textContains("青少年模式").exists && textContains("青少年模式").findOne(500)) {
            l_verbose("青少年模式");
            sleep(500);
            click("我知道了", 0);
        }
    }
    let n = 0;
    do {
        n++;
        let a = currentActivity();
        if (a.indexOf("Splash") > -1) {
            // com.qidian.QDReader.ui.activity.SplashADActivity
            // com.qidian.QDReader.ui.activity.SplashImageActivity
            l_verbose("开屏广告");
        } else if (a.indexOf("activity.QDReader") > -1) {
            l_verbose("阅读界面");
            back();
        } else if (a.indexOf("chapter") > -1) {
            l_verbose("本章说");
            back();
        } else if (a.indexOf("new_msg") > -1) {
            l_verbose("消息中心");
            back();
        } else if (wherePage() == "freecenter") {
            l_verbose("福利中心");
            back();
        } else {
            l_verbose("缓冲……");
        }
        sleep(1000);
        t();
        if (n > 15 && currentPackage() != qidianPackageName) break;
    } while (wherePage() != "index");
    sleep(600);
    t();
    back(); // 有时启动后会在 精选 页
    sleep(600);
    t();
    sleep(600);
    if (wherePage() != "index") {
        l_warn(wherePage(), currentPackage(), currentActivity());
        l_error("似乎未识别到起点首页，请清理进程重新来一遍");
        l_exit();
    }
    swipe(device.width - 50, device.height / 2, device.width - 60, device.height / 2 + 200, 500);

    l_info("起点已启动成功");
}
function enterFreeCenter() {
    if (wherePage() != "index") openQidian();
    sleep(1000);

    if (text("签到").exists()) {
        click("签到", 0);
        l_info("签到");
        sleep(2000);
    }
    if (wherePage() != "index") {
        // 周日兑换直接打开
        l_log("周日直接跳转");
        let m = 0;
        while (m < 15 && wherePage() != "freecenter") {
            m++;
            l_verbose("缓冲");
            sleep(1000);
        }
    } else if (text("领福利").exists()) {
        l_log("领福利");
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
            l_warn(wherePage(), currentPackage(), currentActivity());
            l_warn("没有“福利中心”字样，似乎未成功打开“我”");
            l_exit();
        }
        l_log("成功打开“我”");
        click("福利中心", 0);
    }
    let m = 0;
    while (m < 15 && wherePage() != "freecenter") {
        l_verbose("缓冲中……");
        sleep(1000);
        m++;
    }

    if (wherePage() != "freecenter") {
        l_warn(wherePage(), currentPackage(), currentActivity());
        l_error("没识别到福利中心");
        l_exit();
    }
    l_info("已进入福利中心");
}
function lottery() {
    let result = 0;
    let cb = className("android.widget.TextView").textContains("抽奖机会 ×").findOne(500);
    let j = false;
    if (!cb) {
        let e = className("android.widget.ListView").findOne(500);
        if (e.parent().clickable()) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, e);
            e.parent().click();
            j = true;
            l_verbose("点进签到日历");
            sleep(2000);
            let b = className("android.widget.Button").text("领奖励").findOne(500);
            if (b) {
                b.click();
                sleep(1000);
            }
            scrollShowButton(device.height, 0); // 进入后它会自动向下滚，滚回
            sleep(500);
            cb = className("android.widget.TextView").textContains("抽奖机会 ×").findOne(500);
        } else {
            l_error("没找到链接，无法进入签到日历");
        }
    }
    if (cb) {
        // 有抽奖机会
        l_verbose(cb.text());
        if (j) scrollShowButton(0, cb);
        else freeCenterScrolled = scrollShowButton(freeCenterScrolled, cb);
        cb.click();
        sleep(1000);
        let c = null;
        while (c = className("android.widget.TextView").text("抽奖").findOne(500)) {
            l_log(c.text());
            c.click();
            result = 1;
            sleep(5000);
        }
        className("android.widget.TextView").text("").findOne(500).click(); // 关闭
    } else {
        let d = className("android.widget.Button").text("去兑换 今日").findOne(500);
        if (d) {
            // 今日有周日兑换
            l_verbose(d.text());
            d.click();
            sleep(2000);
            let num = [30, 20, 15]; // 按钮对应碎片数量
            for (let n = 0; n < num.length; n++) {
                let d1 = className("android.widget.TextView").text("".concat(num[n]) + "张碎片兑换").findOne(500);
                if (d1) {
                    let p1 = d1.parent().children();
                    for (let i = 0; i < p1.length; i++) {
                        if (p1[i].clickable() && p1[i].text() == "兑换") {
                            l_log(d1.text());
                            p1[i].click();
                            result = 2;
                            sleep(1000);
                            className("android.widget.Button").text("兑换").findOne(500).click();
                            sleep(2000);
                            if (p1[i].parent().child(i).text() != p1[i].text()) l_verbose("兑换成功");
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
    //判断是否进入视频播放页面
    let ad_raw = -1, ad_clicknewpage = -1; // 生页面、 要再点击一下的页面
    let m = 0;
    do {
        l_verbose("缓冲……");
        sleep(1000);
        if (textContains("验证").exists() || id("tcaptcha_transform_dy").exists()) {
            let c1 = 0;
            while (textContains("验证").exists()) {
                c1++;
                console.setPosition(c_pos[c1 % 2][0], c_pos[c1 % 2][1]);
                //toastLog
                l_log("请手动过一下验证");
                sleep((1 + c1 % 2) * 1000);
            }
            if (c1 > 0) console.setPosition(c_pos[0][0], c_pos[0][1]);
            m = 0;
        }
        m++;
        if (m > 2) {
            //    l_verbose("尝试截图OCR");
            let capimg = captureScreen();
            //capimg = images.clip(capimg, 0, 0, device.width, closeButtonBottom);
            let res = paddle.ocr(capimg);
            for (let i = 0; i < res.length; i++) {
                if (res[i].text.indexOf("可获得奖励") > -1) {
                    //log(i, res[i].text);
                    let sec = res[i].text.replace(/[^\d]/g, "");
                    if (res[i].text.indexOf("点击广告") > -1) {
                        l_log("点：", sec);
                        ad_clicknewpage = sec * 1;
                        break;
                    } else if (res[i].text.indexOf("浏览") > -1) {
                        l_log("览：", sec);
                        ad_raw = sec * 1;
                        break;
                    } else if (res[i].text.indexOf("观看") > -1) {
                        // 冰雪游戏广告
                        l_log("看：", sec);
                        ad_raw = sec * 1;
                        break;
                    }
                }
            }
            if (ad_clicknewpage > -1) {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].text.indexOf("点击") > -1) {
                        // 要点击广告的，额外点击一下
                        let b = res[i].bounds;
                        click(parseInt((b.left + b.right) / 2), parseInt((b.top + b.bottom) / 2));
                    }
                }
                break;
            }
            if (ad_raw > -1) break;
        }
        if (m > 15) {
            l_warn("似乎哪里不对");
            break;
        }
    } while (!(textContains("可获得奖励").exists() || textContains("跳过").exists()));

    if (ad_raw > -1 || ad_clicknewpage > -1) {
        // 新广告
        let sec = ad_clicknewpage;
        if (sec == -1) sec = ad_raw;
        while (sec > 0) {
            sleep(1000);
            sec--;
        }
        l_verbose("应该看完");
        sleep(1000);

        // 看完点X
        let n = 0;
        let try_back_time = 2;
        let xr = device.width - t_click_x_right, yt = closeButtonBottom - t_click_y_top;
        let xc = xr, yc = yt;
        do {
            n++;
            launchQidainIfNot();

            if (n < try_back_time + 1) {
                // 有些旧版本，或手机没装应该跳的app，可能有用
                l_verbose("尝试模拟“手势返回”");
                back();
            } else {
                let n1 = n - try_back_time - 1;
                if (n1 < Object.keys(t_click).length) {
                    let tmp = t_click[Object.keys(t_click)[n1]];
                    l_verbose("尝试点击", tmp.x, tmp.y);
                    click(tmp.x, tmp.y);
                } else {
                    if (xc < device.width - t_click_x_left) {
                        l_error("没点到，放弃");
                        l_warn("请编辑代码前几行，扩大循环点击扫描的范围，试出点击坐标后，再缩小范围。");
                        l_exit();
                    }
                    l_verbose("扫描", xc, yc);
                    click(xc, yc);
                    yc += t_click_step;
                    if (yc > closeButtonBottom + t_click_y_bottom) {
                        yc = yt;
                        xc -= t_click_step;
                    }
                }
            }

            if (wherePage() != "freecenter") {
                let t1 = new Date();
                let capimg = captureScreen();
                let res = paddle.ocr(capimg);
                for (let i = 0; i < res.length; i++) {
                    if (res[i].text.indexOf("可获得奖励") > -1) {
                        sec = res[i].text.replace(/[^\d]/g, "");
                    }
                }
                if (sec > 0) {
                    l_log("续", sec);
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].text.indexOf("点击") > -1 || res[i].text.indexOf("继续") > -1) {
                            let b = res[i].bounds;
                            click(parseInt((b.left + b.right) / 2), parseInt((b.top + b.bottom) / 2));
                        }
                    }
                    while (sec > 0) {
                        sleep(1000);
                        sec--;
                    }
                    l_verbose("应该看完");
                    n = 0;
                }
                let t2 = 1000 - (new Date() - t1);
                if (t2 > 0) sleep(t2);
            } else {
                sleep(1000);
            }
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
        if (className("android.widget.TextView").textContains("跳过").exists()) {
            let thread1 = threads.start(
                function t() {
                    sleep(1000);
                    if (!className("android.widget.TextView").textContains("跳过").exists()) {
                        thread1.interrupt();
                        m = 0;
                        l_log("“跳过”2字没了");
                    }
                }
            );
        }
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
                    l_verbose("退出坐标", parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2));
                } else {
                    l_verbose("计算退出坐标失败，稍后重新获取");
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
                    l_verbose(video_flag);
                    if (v1 == 0) {
                        l_log('结束');
                        sleep(1200);
                        break;
                    } else {
                        v = v1;
                    }
                }
            } else if (video_flag.includes("观看完视频")) {
                l_log("看完结束");
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
                l_log("已看20秒");
                break;
            }
        } while (!(video_flag.includes("已") || m == 0));
        l_verbose("应该已获得奖励");
        thread.interrupt();

        //退出视频
        let n = 0;
        do {
            n++;
            if (n == 1) {
                click(parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2));
            } else if (textContains("可获得奖励").exists()) {
                l_log("退出失败，重新获取退出坐标");
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
                        l_verbose("区域随机点击", x, y);
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
                l_verbose("尝试模拟“手势返回”");
                back();
            } else {
                l_error("未知原因退出失败");
                l_exit();
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
            l_error("没成功获取到游戏中心");
        }
    );
    do {
        l_verbose("缓冲……");
        sleep(1000);
        if (num >= 15) return 1;
    } while (wherePage() != "gamecenter" && wherePage() != "browser");
    thread.interrupt();
    if (wherePage() == "gamecenter") {
        l_info("成功打开游戏中心");
        sleep(1000);
        if (text("在线玩").find().length < 2) {
            l_warn("未识别到“在线玩”");
            return 1;
        }
        let play_btn = text("在线玩").findOnce(0);
        scrollShowButton(0, play_btn);
        play_btn.click();
        l_log("在线玩");
        sleep(2000);
    }
    if (wherePage() == "browser") l_info("应该打开游戏了");
    l_verbose(longdash);
    sleep(1000);

    debugDelay = 30;
    do {
        if (textContains("实名认证").exists()) {
            //身份信息仅用于实名认证使用
            l_warn("似乎有实名认证，请先自行认证");
            sleep(2000);
            back();
            return 2;
        }
        if (second % 60 == 0) {
            l_verbose("倒计时" + (second / 60) + "分钟");
        }
        if (second % 10 == 0) {
            click(random(10, 20), random(10, 20));
        }
        sleep(1000);
        second--;
    } while (second > -5);
    debugDelay = 1;
    l_log("时间到");
    do {
        back();
        sleep(600);
    } while (wherePage() == "");
    return 0;
}
function l_exit() {
    threads.shutDownAll();
    l_warn("退出");
    exit();
}
function myFormatDate(dt) {
    let y = dt.getFullYear();
    let m = "0" + (dt.getMonth() + 1);
    if (m.length > 2) m = m.substring(m.length - 2);
    let d = "0" + dt.getDate();
    if (d.length > 2) d = d.substring(d.length - 2);
    return "".concat(y).concat(m).concat(d);
}
function myFormatTime(dt) {
    let h = "0" + dt.getHours();
    if (h.length > 2) h = h.substring(h.length - 2);
    let m1 = "0" + dt.getMinutes();
    if (m1.length > 2) m1 = m1.substring(m1.length - 2);
    let s = "0" + dt.getSeconds();
    if (s.length > 2) s = s.substring(s.length - 2);
    let m2 = "00" + dt.getMilliseconds();
    if (m2.length > 3) m2 = m2.substring(m2.length - 3);
    return "" + h + ":" + m1 + ":" + s + "." + m2;
}
function writeLog(...a) {
    let dt = new Date();
    files.append(
        logFilePath + "/" + myFormatDate(dt) + ".log",
        myFormatTime(dt) + " " + a.join(" ") + "\n"
    );
}
// arguments
function l_log(...s) {
    console.log.apply(console, s);
    if (logFile || debug) writeLog.apply(null, s);
}
function l_verbose(...s) {
    console.verbose.apply(console, s);
    if (logFile || debug) writeLog.apply(null, s);
}
function l_info(...s) {
    console.info.apply(console, s);
    if (logFile || debug) writeLog.apply(null, s);
}
function l_warn(...s) {
    console.warn.apply(console, s);
    if (logFile || debug) writeLog.apply(null, s);
}
function l_error(...s) {
    console.error.apply(console, s);
    if (logFile || debug) writeLog.apply(null, s);
}
function wherePage() {
    /* 用current判断就会出事
    if (currentPackage() != "com.qidian.QDReader") {
        // 不在起点APP
        l_verbose(currentPackage());
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
function launchQidainIfNot() {
    // 如果当前不在起点，先直接切换回起点
    let p = currentPackage();
    if (p != qidianPackageName) {
        l_verbose(p, getAppName(p));
        launch(qidianPackageName);
        sleep(1000);
    }
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
function getTextOfView(v, e) {
    if (v.equals(e)) return "";
    if (v.className() == "android.widget.TextView") {
        return v.text();
    }
    if (v.childCount() > 0) {
        let t = new Array();
        let v1 = v.children();
        for (let i = 0; i < v1.length; i++) {
            let t1 = getTextOfView(v1[i], e);
            if (t1 != "") t.push(t1);
        }
        return t.join("\n");
    }
    return "";
}
function getDescriptionOnLeft(b) {
    let j = b.indexInParent();
    if (j > 0) return getTextOfView(b.parent().child(j - 1));
    return null;
}
function clickIknown() {
    if (textContains("知道了").exists()) {
        let t = textContains("知道了").findOne(500);
        let t1 = getTextOfView(t.parent().parent(), t);
        t.click();
        //click("知道了", 0);
        if (t1.indexOf("章节卡") > -1 || t1.indexOf("点币") > -1) l_info(t1);
        else l_log(t1);
        let a = "恭喜获得";
        if (t1.substring(0, a.length) == a) {
            let b = t1.substring(a.length);
            while (b.substring(0, 1) == " ") b = b.substring(1);
            if (b in ADReceive) ADReceive[b]++;
            else ADReceive[b] = 1;
        }
        sleep(2000);
    }
}
function sortFormatReceive() {
    function indexLastNum(str) {
        for (let i = str.length - 1; i > 0; i--) {
            let n = str.substring(i - 1, i) * 1;
            if (!isNaN(n)) return i;
        }
        return -1;
    }
    function indexLastNotNum(str) {
        for (let i = str.length - 1; i > 0; i--) {
            let n = str.substring(i - 1, i) * 1;
            if (isNaN(n)) return i;
        }
        return -1;
    }
    let s = new Object();
    Object.keys(ADReceive).forEach(k => {
        let p = indexLastNum(k);
        let a1 = "";
        if (p < 0) a1 = k;
        else a1 = "0" + k.substring(p);
        if (!(a1 in s)) s[a1] = new Object();
        s[a1][k] = ADReceive[k];
    });
    let s1 = new Object();
    let ak = Object.keys(s).sort();
    for (let i = 0; i < ak.length; i++) {
        s1[ak[i]] = new Object();
    }
    Object.keys(s).forEach(k => {
        let t = Object.keys(s[k]).sort((a, b) => {
            let p1 = indexLastNum(a);
            let p2 = indexLastNum(b);
            if (p1 < 0) return 1;
            if (p2 < 0) return -1;
            let a1 = a.substring(0, p1);
            let b1 = b.substring(0, p2);
            let p11 = indexLastNotNum(a1);
            let p21 = indexLastNotNum(b1);
            if (p11 < 0) p11 = 0;
            if (p21 < 0) p21 = 0;
            let a2 = a1.substring(p11) * 1;
            let b2 = b1.substring(p21) * 1;
            return b2 - a2;
        });
        for (let i = 0; i < t.length; i++) {
            s1[k][t[i]] = s[k][t[i]];
        }
    });
    let a = "";
    Object.keys(s1).forEach(k => {
        Object.keys(s1[k]).forEach(n => {
            a += (" " + ADReceive[n] + " × ").concat(n) + "\n";
        });
    });
    if (a.length > 1 && a.substring(a.length - 1) == "\n") a = a.substring(0, a.length - 1);

    return a;
}

// 正式开始------------------------------------------------------------------
var debugDelay = 1;
var debugLoop = null;
if (debug) {
    debugLoop = threads.start(
        function t() {
            let n = 0;
            while (1) {
                sleep(1000);
                n++;
                if (n >= debugDelay) {
                    let p = currentPackage();
                    writeLog(p, getAppName(p), currentActivity(), wherePage());
                    n = 0;
                }
            }
        }
    );
}


home();
sleep(500);

// 打开起点
openQidian();
l_log(longdash);
sleep(1500);

// 进入福利中心
enterFreeCenter();
l_log(longdash);
sleep(2000);

// 签到里面的抽奖、兑换
l_log("开始抽奖");
let result = lottery();
if (result == 1) l_info("抽奖完成");
else if (result == 2) l_info("兑换完成");
else l_log("无抽奖");
l_log(longdash);
sleep(2000);

// 开始看广告
l_log("开始看广告");
let targets = ["看视频", "去完成"]; // 目标按钮字符
let expstring = ["白泽宇航员", "玩游戏", "更新提醒", "推送通知", "充值", "携程"]; // 目标按钮左边如果有这些字，跳过
let viewADnum = 0;
let ADReceive = new Object();
do {
    let targetNum = 0, targetFalse = 0;
    for (let i = 0; i < targets.length; i++) {
        let target = targets[i];
        if (text(target).exists()) {
            let aa = text(target).find();
            targetNum += aa.length;
            for (let ii = 0; ii < aa.length; ii++) {
                freeCenterScrolled = scrollShowButton(freeCenterScrolled, aa[ii]);
                //l_verbose(target);
                let f = false;
                let s = getDescriptionOnLeft(aa[ii]);
                if (s) {
                    // 其实感觉这样判断可能以后会有隐患，或许以前用坐标高度不会出错
                    expstring.forEach(e => {
                        if (s.indexOf(e) > -1) f = true;
                    });
                }
                if (f) {
                    targetFalse++;
                } else {
                    l_verbose(longdash);
                    viewADnum++;
                    l_verbose("广告", viewADnum, "开始");
                    l_log(s);
                    aa[ii].click();
                    //(textContains("今日领奖上限").exists()) 
                    sleep(2000);
                    if (text("可从这里回到福利页哦").exists()) click("我知道了", 0);
                    if (textContains("播放将消耗流量").exists()) click("继续播放", 0);
                    let p = wherePage();
                    if (p == "freecenter") {
                        l_error("似乎没有点到，或没有跳转");
                        l_exit();
                    }
                    if (p == "index") {
                        l_warn("似乎跳首页了，请限制左边有某些词的时候不要点这个按钮");
                        l_exit();
                    }
                    video_look();
                    l_verbose("广告", viewADnum, "结束");
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
    l_verbose(longdash);
    l_info("结束看广告");
    l_verbose("本次共看", viewADnum, "个广告\n获得：\n".concat(sortFormatReceive()));
} else {
    l_log("无广告");
}
freeCenterScrolled = scrollShowButton(freeCenterScrolled, 0);
l_log(longdash);
sleep(2000);

// 其它脚本里的听书等活动，快一年了还没有，先删

// 玩游戏
let gamebtntext = "去完成"; // 按钮字符
let gameremain = "再玩"; // 有这个字符，进入玩游戏
if (textContains(gameremain).exists()) {
    l_log("开始玩游戏");
    let num = 0;
    do {
        if (num > 5) {
            l_error("已经循环5次了，可能哪里判定不太对，先退出");
            break;
        }
        let b = null;
        let aa = text(gamebtntext).find();
        for (let i = 0; i < aa.length; i++) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, aa[i]);
            let s = getDescriptionOnLeft(aa[i]);
            if (s && s.indexOf(gameremain) > -1) {
                b = aa[i];
                break;
            }
        }
        if (b != null) {
            let playLabel = textContains(gameremain).findOne(500);
            l_log(playLabel.text());
            let min = playLabel.text().replace(/[^\d]/g, "");
            b.click();
            sleep(5000);
            let res = game_play(min);
            sleep(2000);
            if (wherePage() == "gamecenter") back();
            sleep(3000);
            if (res != 0) break;
        } else {
            l_error("没找到对应的“" + gamebtntext + "”按钮，可能起点改了布局或按钮字符");
        }
        num++;
        sleep(1000);
    } while (textContains(gameremain).exists());
    l_info("结束玩游戏");
    freeCenterScrolled = scrollShowButton(freeCenterScrolled, 0);
    l_log(longdash);
    sleep(1000);
}

// 领游戏与看书时长的
l_log("有无可领");
let bonusButtonTexts = ["领奖励", "领积分"];
let bonusNum = 0;
bonusButtonTexts.forEach(btnt => {
    if (text(btnt).exists()) {
        let btn = text(btnt).find();
        for (let i = 0; i < btn.length; i++) {
            freeCenterScrolled = scrollShowButton(freeCenterScrolled, btn[i]);
            l_verbose(longdash);
            l_verbose(getDescriptionOnLeft(btn[i]));
            btn[i].click();
            bonusNum++;
            sleep(2000);
            clickIknown();
            let btn_now = btn[i].parent().child(btn[i].indexInParent());
            if (btn_now.text() == btnt) {
                l_error("似乎领取失败");
            } else {
                let d1 = getDescriptionOnLeft(btn_now).split("\n");
                d1.shift();
                l_log(d1.join("\n"));
            }
        }
    }
});
if (bonusNum == 0) l_log("无");
l_log(longdash);
sleep(1000);

l_info("脚本已结束");
l_log("记得清理auto.js后台");
l_verbose("控制台3秒后自动关闭");
sleep(3000);
console.hide();
threads.shutDownAll();
engines.stopAllAndToast();
l_exit();
