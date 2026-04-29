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
  L: make("L", [
    [F.Thumb, C.NoCurl, 1.0, D.HorizontalRight, 1.0],
    [F.Index, C.NoCurl, 1.0, D.VerticalUp, 1.0],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.FullCurl, 1.0, D.VerticalUp, 0.75],
  ]),
  O: make("O", [
    [F.Thumb, C.HalfCurl, 1.0, D.DiagonalUpRight, 0.75],
    [F.Index, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Middle, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Ring, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
    [F.Pinky, C.HalfCurl, 1.0, D.DiagonalUpLeft, 0.75],
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
  Y: make("Y", [
    [F.Thumb, C.NoCurl, 1.0, D.DiagonalUpRight, 1.0],
    [F.Index, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Middle, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Ring, C.FullCurl, 1.0, D.VerticalUp, 0.75],
    [F.Pinky, C.NoCurl, 1.0, D.VerticalUp, 1.0],
  ]),
};

export const gestureList = Object.values(gestures);
