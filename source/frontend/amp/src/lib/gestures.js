import {
  GestureDescription,
  Finger,
  FingerCurl,
  FingerDirection,
} from "fingerpose";

const C = FingerCurl;
const D = FingerDirection;
const F = Finger;

function make(name, rules) {
  const g = new GestureDescription(name);
  rules.forEach(([finger, curl, curlW, dir, dirW]) => {
    if (curl !== null && curl !== undefined)
      g.addCurl(finger, curl, curlW ?? 1.0);
    if (dir !== null && dir !== undefined)
      g.addDirection(finger, dir, dirW ?? 0.75);
  });
  return g;
}

export const gestures = {
  A: make("A", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  B: make("B", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  C: make("C", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  D: make("D", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  E: make("E", [
    [F.Thumb, C.HalfCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.HorizontalLeft, 1.0],
    [F.Middle, C.HalfCurl, 1.0, D.HorizontalLeft, 1.0],
    [F.Ring, C.HalfCurl, 1.0, D.HorizontalLeft, 1.0],
    [F.Pinky, C.HalfCurl, 1.0, D.HorizontalLeft, 1.0],
  ]),
  F: make("F", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  G: make("G", [
    [F.Thumb, C.NoCurl, 1.0, D.HorizontalRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.HorizontalRight, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  H: make("H", [
    [F.Thumb, C.HalfCurl, 1.0, D.VerticalUp, 0.5],
    [F.Index, C.NoCurl, 1.0, D.HorizontalRight, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.HorizontalRight, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  I: make("I", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  J: make("J", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.DiagonalDownRight, 0.75],
  ]),
  K: make("K", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  L: make("L", [
    [F.Thumb, C.NoCurl, 1.0, D.HorizontalRight, 1.0],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  M: make("M", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.VerticalDown, 0.75],
    [F.Middle, C.HalfCurl, 1.0, D.VerticalDown, 0.75],
    [F.Ring, C.HalfCurl, 1.0, D.VerticalDown, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalDown, 0.75],
  ]),
  N: make("N", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.VerticalDown, 0.75],
    [F.Middle, C.HalfCurl, 1.0, D.VerticalDown, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalDown, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalDown, 0.75],
  ]),
  O: make("O", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Middle, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Ring, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Pinky, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
  ]),
  P: make("P", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalDownRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalDown, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalDownRight, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalDown, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalDown, 0.75],
  ]),
  Q: make("Q", [
    [F.Thumb, C.NoCurl, 1.0, D.VerticalDown, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalDown, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalDown, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalDown, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalDown, 0.75],
  ]),
  R: make("R", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.5],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  S: make("S", [
    [F.Thumb, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  T: make("T", [
    [F.Thumb, C.HalfCurl, 1.0, D.HorizontalRight, 0.75],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  U: make("U", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.5],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  V: make("V", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.5],
    [F.Index, C.NoCurl, 1.0, D.DiagonalUpLeft, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalUpRight, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  W: make("W", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.5],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  X: make("X", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  Y: make("Y", [
    [F.Thumb, C.NoCurl, 1.0, D.DiagonalUpRight, 1.0],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  Z: make("Z", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Index, C.NoCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
};

export const numberGestures = {
  0: make("0", [
    [F.Thumb, C.NoCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Ring, C.NoCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.DiagonalUpLeft, 0.75],
  ]),
  1: make("1", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  2: make("2", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.NoCurl, 1.0, D.DiagonalUpLeft, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.DiagonalUpRight, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  3: make("3", [
    [F.Thumb, C.NoCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  4: make("4", [
    [F.Thumb, C.FullCurl, 1.0, D.HorizontalLeft, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  5: make("5", [
    [F.Thumb, C.NoCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  6: make("6", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
  ]),
  7: make("7", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  8: make("8", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
  9: make("9", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.FullCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Middle, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Ring, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
};

export const gestureList = Object.values(gestures);
export const numberGestureList = Object.values(numberGestures);
export const allGestureList = [...gestureList, ...numberGestureList];
