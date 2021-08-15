import Canvas from "canvas";
import fs from "fs";
import { config } from "./lib.js";

const fontSize = config.captcha.fontSize;
const font = config.captcha.font;
const padding = config.captcha.padding;
const letterSpacing = config.captcha.letterSpacing;
const bgColor = config.captcha.backgroundColor;

const randomArrayEntry = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const genString = (length) => {
  let string = "";
  for (let i = 0; i < length; i++) {
    string += randomArrayEntry(config.captcha.genString.split(""));
  }
  return string;
};

const drawString = (string) => {
  const tmpC = Canvas.createCanvas(500, 500);
  const tmpCtx = tmpC.getContext("2d");

  tmpCtx.font = fontSize + "px " + font;

  let text = tmpCtx.measureText(string);

  const width = text.width * letterSpacing + padding;
  const height = fontSize + padding + text.emHeightDescent;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.font = fontSize + "px " + font;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  for (let i in string) {
    const textOffsetX =
      ctx.measureText(string.substring(0, i)).width * letterSpacing +
      (config.captcha.movement ? random(-3, 3) : 0);
    const textOffsetY = config.captcha.movement ? random(-3, 3) : 0;
    const rot = Math.random() - 0.5;
    drawLetter(
      ctx,
      string[i],
      textOffsetX + padding / 2 + 3,
      textOffsetY + padding / 2 + 3,
      rot,
      "black"
    );
    drawLetter(
      ctx,
      string[i],
      textOffsetX + padding / 2,
      textOffsetY + padding / 2,
      rot,
      bgColor
    );
  }

  const lines = random(3, 10);

  if (config.captcha.lines) {
    for (let i = 0; i < lines; i++)
      drawLine(
        ctx,
        width,
        height,
        randomArrayEntry(["red", "green", "black", "yellow"])
      );
  }

  return canvas;
};

const drawLetter = (
  ctx,
  letter,
  offsetX,
  offsetY,
  rotation,
  fillStyle = "white"
) => {
  ctx.save();
  ctx.translate(offsetX, fontSize + offsetY);
  if (config.captcha.rotation) {
    ctx.rotate(rotation);
  }
  ctx.fillStyle = fillStyle;
  ctx.fillText(letter, 0, 0);
  ctx.restore();
};

const drawLine = (ctx, width, height, color = "black") => {
  ctx.beginPath();
  ctx.lineWidth = Math.random();
  ctx.strokeStyle = color;
  ctx.moveTo(0, random(0, height));
  ctx.lineTo(width, random(0, height));
  ctx.stroke();
};

export const generate = (saveLocation) => {
  const string = genString(
    random(config.captcha.minLetters, config.captcha.maxLetters)
  );
  saveImg(drawString(string), saveLocation);
  return string;
};

const saveImg = (canvas, filePath) => {
  let out = fs.createWriteStream(filePath);
  let stream = canvas.pngStream();

  stream.on("data", function (chunk) {
    out.write(chunk);
  });

  stream.on("end", function () {
    console.log("Generated Captcha");
  });
};
