import { GestureDescription, Finger, FingerCurl, FingerDirection } from 'fingerpose';

const C = FingerCurl;
const D = FingerDirection;
const F = Finger;

function make(name, rules) {
    const g = new GestureDescription(name);
    rules.forEach(([finger, curl, curlW, dir, dirW]) => {
        if (curl !== null && curl !== undefined) g.addCurl(finger, curl, curlW ?? 1.0);
        if (dir  !== null && dir  !== undefined) g.addDirection(finger, dir, dirW ?? 0.75);
    });
    return g;
}

export const gestures = {
    // A: fist — four fingers fully curled, thumb rests BESIDE index (HalfCurl, DiagonalUpLeft)
    //    KEY DIFF from S: thumb is beside the fist, not over it
    A: make('A', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,  0.75],
        [F.Index,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // B: four fingers up, thumb tucked into palm (FullCurl)
    B: make('B', [
        [F.Thumb,  C.FullCurl, 1.0, D.HorizontalLeft,   0.75],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Ring,   C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Pinky,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
    ]),
    // C: all fingers curved into C shape (HalfCurl)
    C: make('C', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Index,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Middle, C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Ring,   C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Pinky,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
    ]),
    // D: index up, others curl to touch thumb
    D: make('D', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // E: fingers bent at MCP, thumb tucked under
    E: make('E', [
        [F.Thumb,  C.HalfCurl, 1.0, D.HorizontalLeft,   0.75],
        [F.Index,  C.HalfCurl, 1.0, D.HorizontalLeft,   1.0],
        [F.Middle, C.HalfCurl, 1.0, D.HorizontalLeft,   1.0],
        [F.Ring,   C.HalfCurl, 1.0, D.HorizontalLeft,   1.0],
        [F.Pinky,  C.HalfCurl, 1.0, D.HorizontalLeft,   1.0],
    ]),
    // F: index+thumb pinch circle, other 3 fingers up
    F: make('F', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Index,  C.FullCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Middle, C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Ring,   C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Pinky,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
    ]),
    // G: index+thumb point horizontally right
    G: make('G', [
        [F.Thumb,  C.NoCurl,   1.0, D.HorizontalRight,  0.75],
        [F.Index,  C.NoCurl,   1.0, D.HorizontalRight,  1.0],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // H: index+middle point horizontal, others curled
    H: make('H', [
        [F.Thumb,  C.HalfCurl, 1.0, D.VerticalUp,       0.5],
        [F.Index,  C.NoCurl,   1.0, D.HorizontalRight,  1.0],
        [F.Middle, C.NoCurl,   1.0, D.HorizontalRight,  1.0],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // I: pinky up, rest curled
    I: make('I', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Index,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
    ]),
    // L: thumb up/right + index up, others curled
    L: make('L', [
        [F.Thumb,  C.NoCurl,   1.0, D.HorizontalRight,  1.0],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // O: all fingers curve to meet thumb (O shape)
    O: make('O', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Index,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Middle, C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Ring,   C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
        [F.Pinky,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.75],
    ]),
    // R: index+middle crossed, others curled
    R: make('R', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.NoCurl,   1.0, D.DiagonalUpLeft,   0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // S: tight fist, thumb OVER knuckles (FullCurl thumb)
    //    KEY DIFF from A: thumb is FullCurl over knuckles
    S: make('S', [
        [F.Thumb,  C.FullCurl, 1.0, D.DiagonalUpRight,  0.75],
        [F.Index,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // U: index+middle up together, others curled
    U: make('U', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // V: index+middle apart (peace sign)
    V: make('V', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
        [F.Index,  C.NoCurl,   1.0, D.DiagonalUpLeft,   1.0],
        [F.Middle, C.NoCurl,   1.0, D.DiagonalUpRight,  1.0],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // W: index+middle+ring up (three fingers)
    W: make('W', [
        [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
        [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Middle, C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Ring,   C.NoCurl,   1.0, D.VerticalUp,       1.0],
        [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
    ]),
    // Y: thumb+pinky out (shaka)
    Y: make('Y', [
        [F.Thumb,  C.NoCurl,   1.0, D.DiagonalUpRight,  1.0],
        [F.Index,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Middle, C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
        [F.Pinky,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
    ]),
};

export const gestureList = Object.values(gestures);
