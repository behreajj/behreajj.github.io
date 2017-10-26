class CubicBezier {
  constructor() {}

  getClass() {
    return this.constructor.name;
  }
}

CubicBezier.calcPoint = function(pt0, pt1, pt2, pt3, st) {
  if (st <= 0.0) {
    return pt0.copy();
  } else if (st >= 1.0) {
    return pt3.copy();
  }

  let inv = 1.0 - st;
  let stsq = st * st;
  let invsq = inv * inv;

  return Vector.scale(pt0, invsq * inv)
    .add(Vector.scale(pt1, 3.0 * invsq * st))
    .add(Vector.scale(pt2, 3.0 * stsq * inv))
    .add(Vector.scale(pt3, stsq * st));
}

CubicBezier.calcPoints = function(pt0, pt1, pt2, pt3, lod) {
  let result = [];
  let lodf = lod - 1.0;
  for (let i = 0; i < lod; ++i) {
    result.push(CubicBezier.calcPoint(pt0, pt1, pt2, pt3, i / lodf));
  }
  return result;
}

CubicBezier.calcTangent = function(pt0, pt1, pt2, pt3, st) {
  if (st <= 0.0) {
    return Vector.sub(pt1, pt0);
  } else if (st >= 1.0) {
    return Vector.sub(pt3, pt2);
  }

  let inv = 1.0 - st;
  return Vector.sub(pt1, pt0).scale(3.0 * inv * inv)
    .add(Vector.sub(pt2, pt1).scale(6.0 * inv * st))
    .add(Vector.sub(pt3, pt2).scale(3.0 * st * st));
}

CubicBezier.calcTangents = function(pt0, pt1, pt2, pt3, lod) {
  let result = [];
  let lodf = lod - 1.0;
  for (let i = 0; i < lod; ++i) {
    result.push(CubicBezier.calcTangent(pt0, pt1, pt2, pt3, i / lodf));
  }
  return result;
}

CubicBezier.calcTransform = function(pt0, pt1, pt2, pt3, st) {
  let pt = null;
  let tn = null;

  if (st <= 0.0) {
    pt = pt0
    tn = Vector.sub(pt1, pt0);
  } else if (st >= 1.0) {
    pt = pt3;
    tn = Vector.sub(pt3, pt2);
  } else {
    // For convenience:
    // pt = CubicBezier.calcPoint(pt0, pt1, pt2, pt3, st);
    // tn = CubicBezier.calcTangent(pt0, pt1, pt2, pt3, st);

    // Consolidation as micro-optimization:
    let inv = 1.0 - st;
    let stsq = st * st;
    let invsq = inv * inv;
    let invsq3 = 3.0 * invsq;
    let stsq3 = 3.0 * stsq;

    pt = Vector.scale(pt0, invsq * inv)
      .add(Vector.scale(pt1, invsq3 * st))
      .add(Vector.scale(pt2, stsq3 * inv))
      .add(Vector.scale(pt3, stsq * st));

    tn = Vector.sub(pt1, pt0).scale(invsq3)
      .add(Vector.sub(pt2, pt1).scale(6.0 * inv * st))
      .add(Vector.sub(pt3, pt2).scale(stsq3));
  }

  tn.norm();
  return Matrix4x4.calcOrientation(pt, tn);
}

CubicBezier.calcTransforms = function(pt0, pt1, pt2, pt3, lod) {
  let result = [];
  let lodf = lod - 1.0;
  for (let i = 0; i < lod; ++i) {
    result.push(CubicBezier.calcTransform(pt0, pt1, pt2, pt3, i / lodf));
  }
  return result;
}

CubicBezier.defaultConstructionWidth = 0.75;
CubicBezier.defaultConstructionStyle = 'rgba(255, 255, 255, .25)';
CubicBezier.defaultCurveWidth = 1.5;
CubicBezier.defaultCurveStyle = '#000000';
