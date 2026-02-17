'use strict';

const $setting = document.querySelector('#setting');
const $canvas = document.getElementById('canvas');
const $random = document.getElementById('random');
const $again = document.getElementById('again');
const $slow = document.getElementById('slow');
const $speed = document.getElementById('speed');
const $name = document.getElementById('name');

// 画像データ
var img_data = [
  /* 0 */ { id: '01', up: 0, left: 0, name: '<ruby>ハサミ<rt></rt></ruby>', },
  /* 1 */ { id: '02', up: 0, left: 1, name: '<ruby>くし<rt></rt></ruby>',   },
  /* 2 */ { id: '03', up: 0, left: 2, name: '<ruby>100円玉<rt></rt></ruby>', },
  /* 3 */ { id: '04', up: 0, left: 3, name: '<ruby>ハンカチ<rt></rt></ruby>',   },
  /* 4 */ { id: '05', up: 0, left: 4, name: '<ruby>マッチ<rt></rt></ruby>', },
  /* 5 */ { id: '06', up: 1, left: 0, name: '<ruby>歯ブラシ<rt></rt></ruby>', },
  /* 6 */ { id: '07', up: 1, left: 1, name: '<ruby>万年筆<rt>まんねんひつ</rt></ruby>', },
  /* 7 */ { id: '08', up: 1, left: 2, name: '<ruby>鉛筆<rt>えんぴつ</rt></ruby>', },
  /* 8 */ { id: '09', up: 1, left: 3, name: '<ruby>カギ<rt></rt></ruby>', },
  /* 9 */ { id: '10', up: 1, left: 4, name: '<ruby>鏡<rt>かがみ</rt></ruby>', },
];

// クラス
var ImgObj = function(datum, ctx) {
  this.__initialize.apply(this, arguments);
};

// 初期化
ImgObj.prototype.__initialize = function(datum, ctx) {
  var img = new Image();

  this.img = img;
  this.img.src = './img/' + datum.id + '.jpg'

  var __this = this;  // thisってわからん。。。
  __this.x = datum.left * (227 / 2 + 5) + 5;
  __this.y = datum.up * (416 / 2 + 10) + 10;
  __this.w = 227 / 2;
  __this.h = 416 / 2;

  this.name = datum.name;

  this.img.onload = function() {
    // 画像ロード後、描画
    ctx.drawImage(img, __this.x, __this.y, __this.w, __this.h);
  };
};

// 指定座標での存在有無
ImgObj.prototype.exist = function(x, y) {
  return (this.x <= x && this.x + this.w >= x
          && this.y <= y && this.y + this.h >= y);
};

var start = function() {
  var audio = new Audio();
  var ctx = $canvas.getContext('2d');
  var wav_datum = null;
  var old_random = null;

  var imgs = [];
  for (var i = 0; i < img_data.length; i++) {
    imgs[i] = new ImgObj(img_data[i], ctx);
  }

  // raw_rand の Max 値
  var raw_rand_max = 0;
  for (var datum of wav_data) {
    raw_rand_max += datum.img_idx.length;
  }

  // ランダム取得
  var random_get = () => {
    // raw_rand は 0～33
    var raw_rand = Math.floor(Math.random() * raw_rand_max);
    var sum = 0;
    for (var i = 0; i < wav_data.length; i++) {
      sum += wav_data[i].img_idx.length;
      if (sum > raw_rand) {
        console.log("rand=", i, "raw_land=", raw_rand);
        return i;
      }
    }
    return wav_data.length - 1; //
  };

  var playbackRate = 1.0;

  // ランダム
  $random.addEventListener('click', function(e) {
    var random = null;

    do {
      //random = Math.floor(Math.random() * wav_data.length);
      random = random_get();
      // 前回のランダム値が同一であれば、再度、ランダムする
    } while (random == old_random);

    // 画像を再表示
    ctx.clearRect(0, 0, 600, 450);
    for (var i = 0; i < img_data.length; i++) {
      imgs[i] = new ImgObj(img_data[i], ctx);
    }

    // 文章を消す
    $setting.innerHTML = ''

    // 音声表示
    wav_datum = wav_data[random];
    console.log(wav_datum);
    playbackRate = 1.0;
    audio.src = './audio/' + wav_datum.id + '.mp3';
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    audio.play();

    $speed.textContent = playbackRate;

    old_random = random;
  }, false);

  // もう一度
  $again.addEventListener('click', function(e) {
    if (wav_datum === null)
      return;

    // 同一音声表示
    console.log(wav_datum);
    audio.currentTime = 0;
    audio.play();
  }, false);

  // スロー
  $slow.addEventListener('click', function(e) {
    if (wav_datum === null)
      return;

    // 再生側後を遅く
    audio.currentTime = 0;
    playbackRate = Math.round((playbackRate - 0.2) * 10) / 10;
    audio.playbackRate = playbackRate;

    $speed.textContent = playbackRate;
  }, false);

  // 文章表示
  $setting.addEventListener('click', function(e) {
    if (wav_datum === null)
      return;

    // 文章表示
    console.log(wav_datum.text);
    $setting.innerHTML = '[' + wav_datum.id + '] ' + wav_datum.text;

    // 画像に枠表示
    ctx.clearRect(0, 0, 600, 450);
    for (var i of wav_datum.img_idx) {
      console.log(i);
      var img = imgs[i];
      // 枠を書く
      ctx.strokeRect(img.x - 2, img.y - 2, img.w + 4, img.h + 4);
    }
    for (var i = 0; i < img_data.length; i++) {
      imgs[i] = new ImgObj(img_data[i], ctx);
    }
  }, false);

  // 画像の名称を表示
  canvas.addEventListener('click', function(e) {
    var x = e.clientX - canvas.offsetLeft,
        y = e.clientY - canvas.offsetTop;

    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].exist(x, y)) {
        console.log(imgs[i]);
        if ($name.innerHTML !== imgs[i].name) {
          $name.innerHTML = imgs[i].name;
        } else {
          // 一旦、画像の名称を消す
          $name.innerHTML = '';
        }
      }
    }
  }, false);
};

start();
