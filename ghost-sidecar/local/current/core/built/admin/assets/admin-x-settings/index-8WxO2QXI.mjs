class V {
  /**
  Get the line description around the given position.
  */
  lineAt(t) {
    if (t < 0 || t > this.length)
      throw new RangeError(`Invalid position ${t} in document of length ${this.length}`);
    return this.lineInner(t, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(t) {
    if (t < 1 || t > this.lines)
      throw new RangeError(`Invalid line number ${t} in ${this.lines}-line document`);
    return this.lineInner(t, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(t, e, i) {
    let n = [];
    return this.decompose(
      0,
      t,
      n,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      n,
      3
      /* Open.To */
    ), this.decompose(
      e,
      this.length,
      n,
      1
      /* Open.From */
    ), Ht.from(n, this.length - (e - t) + i.length);
  }
  /**
  Append another document to this one.
  */
  append(t) {
    return this.replace(this.length, this.length, t);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(t, e = this.length) {
    let i = [];
    return this.decompose(t, e, i, 0), Ht.from(i, e - t);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(t) {
    if (t == this)
      return !0;
    if (t.length != this.length || t.lines != this.lines)
      return !1;
    let e = this.scanIdentical(t, 1), i = this.length - this.scanIdentical(t, -1), n = new qe(this), r = new qe(t);
    for (let o = e, l = e; ; ) {
      if (n.next(o), r.next(o), o = 0, n.lineBreak != r.lineBreak || n.done != r.done || n.value != r.value)
        return !1;
      if (l += n.value.length, n.done || l >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(t = 1) {
    return new qe(this, t);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(t, e = this.length) {
    return new go(this, t, e);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(t, e) {
    let i;
    if (t == null)
      i = this.iter();
    else {
      e == null && (e = this.lines + 1);
      let n = this.line(t).from;
      i = this.iterRange(n, Math.max(n, e == this.lines + 1 ? this.length : e <= 1 ? 0 : this.line(e - 1).to));
    }
    return new mo(i);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let t = [];
    return this.flatten(t), t;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(t) {
    if (t.length == 0)
      throw new RangeError("A document must have at least one line");
    return t.length == 1 && !t[0] ? V.empty : t.length <= 32 ? new Y(t) : Ht.from(Y.split(t, []));
  }
}
class Y extends V {
  constructor(t, e = wa(t)) {
    super(), this.text = t, this.length = e;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(t, e, i, n) {
    for (let r = 0; ; r++) {
      let o = this.text[r], l = n + o.length;
      if ((e ? i : l) >= t)
        return new xa(n, l, i, o);
      n = l + 1, i++;
    }
  }
  decompose(t, e, i, n) {
    let r = t <= 0 && e >= this.length ? this : new Y(Ns(this.text, t, e), Math.min(e, this.length) - Math.max(0, t));
    if (n & 1) {
      let o = i.pop(), l = Oi(r.text, o.text.slice(), 0, r.length);
      if (l.length <= 32)
        i.push(new Y(l, o.length + r.length));
      else {
        let a = l.length >> 1;
        i.push(new Y(l.slice(0, a)), new Y(l.slice(a)));
      }
    } else
      i.push(r);
  }
  replace(t, e, i) {
    if (!(i instanceof Y))
      return super.replace(t, e, i);
    let n = Oi(this.text, Oi(i.text, Ns(this.text, 0, t)), e), r = this.length + i.length - (e - t);
    return n.length <= 32 ? new Y(n, r) : Ht.from(Y.split(n, []), r);
  }
  sliceString(t, e = this.length, i = `
`) {
    let n = "";
    for (let r = 0, o = 0; r <= e && o < this.text.length; o++) {
      let l = this.text[o], a = r + l.length;
      r > t && o && (n += i), t < a && e > r && (n += l.slice(Math.max(0, t - r), e - r)), r = a + 1;
    }
    return n;
  }
  flatten(t) {
    for (let e of this.text)
      t.push(e);
  }
  scanIdentical() {
    return 0;
  }
  static split(t, e) {
    let i = [], n = -1;
    for (let r of t)
      i.push(r), n += r.length + 1, i.length == 32 && (e.push(new Y(i, n)), i = [], n = -1);
    return n > -1 && e.push(new Y(i, n)), e;
  }
}
class Ht extends V {
  constructor(t, e) {
    super(), this.children = t, this.length = e, this.lines = 0;
    for (let i of t)
      this.lines += i.lines;
  }
  lineInner(t, e, i, n) {
    for (let r = 0; ; r++) {
      let o = this.children[r], l = n + o.length, a = i + o.lines - 1;
      if ((e ? a : l) >= t)
        return o.lineInner(t, e, i, n);
      n = l + 1, i = a + 1;
    }
  }
  decompose(t, e, i, n) {
    for (let r = 0, o = 0; o <= e && r < this.children.length; r++) {
      let l = this.children[r], a = o + l.length;
      if (t <= a && e >= o) {
        let h = n & ((o <= t ? 1 : 0) | (a >= e ? 2 : 0));
        o >= t && a <= e && !h ? i.push(l) : l.decompose(t - o, e - o, i, h);
      }
      o = a + 1;
    }
  }
  replace(t, e, i) {
    if (i.lines < this.lines)
      for (let n = 0, r = 0; n < this.children.length; n++) {
        let o = this.children[n], l = r + o.length;
        if (t >= r && e <= l) {
          let a = o.replace(t - r, e - r, i), h = this.lines - o.lines + a.lines;
          if (a.lines < h >> 4 && a.lines > h >> 6) {
            let f = this.children.slice();
            return f[n] = a, new Ht(f, this.length - (e - t) + i.length);
          }
          return super.replace(r, l, a);
        }
        r = l + 1;
      }
    return super.replace(t, e, i);
  }
  sliceString(t, e = this.length, i = `
`) {
    let n = "";
    for (let r = 0, o = 0; r < this.children.length && o <= e; r++) {
      let l = this.children[r], a = o + l.length;
      o > t && r && (n += i), t < a && e > o && (n += l.sliceString(t - o, e - o, i)), o = a + 1;
    }
    return n;
  }
  flatten(t) {
    for (let e of this.children)
      e.flatten(t);
  }
  scanIdentical(t, e) {
    if (!(t instanceof Ht))
      return 0;
    let i = 0, [n, r, o, l] = e > 0 ? [0, 0, this.children.length, t.children.length] : [this.children.length - 1, t.children.length - 1, -1, -1];
    for (; ; n += e, r += e) {
      if (n == o || r == l)
        return i;
      let a = this.children[n], h = t.children[r];
      if (a != h)
        return i + a.scanIdentical(h, e);
      i += a.length + 1;
    }
  }
  static from(t, e = t.reduce((i, n) => i + n.length + 1, -1)) {
    let i = 0;
    for (let d of t)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let p of t)
        p.flatten(d);
      return new Y(d, e);
    }
    let n = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), r = n << 1, o = n >> 1, l = [], a = 0, h = -1, f = [];
    function c(d) {
      let p;
      if (d.lines > r && d instanceof Ht)
        for (let g of d.children)
          c(g);
      else d.lines > o && (a > o || !a) ? (u(), l.push(d)) : d instanceof Y && a && (p = f[f.length - 1]) instanceof Y && d.lines + p.lines <= 32 ? (a += d.lines, h += d.length + 1, f[f.length - 1] = new Y(p.text.concat(d.text), p.length + 1 + d.length)) : (a + d.lines > n && u(), a += d.lines, h += d.length + 1, f.push(d));
    }
    function u() {
      a != 0 && (l.push(f.length == 1 ? f[0] : Ht.from(f, h)), h = -1, a = f.length = 0);
    }
    for (let d of t)
      c(d);
    return u(), l.length == 1 ? l[0] : new Ht(l, e);
  }
}
V.empty = /* @__PURE__ */ new Y([""], 0);
function wa(s) {
  let t = -1;
  for (let e of s)
    t += e.length + 1;
  return t;
}
function Oi(s, t, e = 0, i = 1e9) {
  for (let n = 0, r = 0, o = !0; r < s.length && n <= i; r++) {
    let l = s[r], a = n + l.length;
    a >= e && (a > i && (l = l.slice(0, i - n)), n < e && (l = l.slice(e - n)), o ? (t[t.length - 1] += l, o = !1) : t.push(l)), n = a + 1;
  }
  return t;
}
function Ns(s, t, e) {
  return Oi(s, [""], t, e);
}
class qe {
  constructor(t, e = 1) {
    this.dir = e, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [t], this.offsets = [e > 0 ? 1 : (t instanceof Y ? t.text.length : t.children.length) << 1];
  }
  nextInner(t, e) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, n = this.nodes[i], r = this.offsets[i], o = r >> 1, l = n instanceof Y ? n.text.length : n.children.length;
      if (o == (e > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        e > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((r & 1) == (e > 0 ? 0 : 1)) {
        if (this.offsets[i] += e, t == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        t--;
      } else if (n instanceof Y) {
        let a = n.text[o + (e < 0 ? -1 : 0)];
        if (this.offsets[i] += e, a.length > Math.max(0, t))
          return this.value = t == 0 ? a : e > 0 ? a.slice(t) : a.slice(0, a.length - t), this;
        t -= a.length;
      } else {
        let a = n.children[o + (e < 0 ? -1 : 0)];
        t > a.length ? (t -= a.length, this.offsets[i] += e) : (e < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(e > 0 ? 1 : (a instanceof Y ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(t = 0) {
    return t < 0 && (this.nextInner(-t, -this.dir), t = this.value.length), this.nextInner(t, this.dir);
  }
}
class go {
  constructor(t, e, i) {
    this.value = "", this.done = !1, this.cursor = new qe(t, e > i ? -1 : 1), this.pos = e > i ? t.length : 0, this.from = Math.min(e, i), this.to = Math.max(e, i);
  }
  nextInner(t, e) {
    if (e < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    t += Math.max(0, e < 0 ? this.pos - this.to : this.from - this.pos);
    let i = e < 0 ? this.pos - this.from : this.to - this.pos;
    t > i && (t = i), i -= t;
    let { value: n } = this.cursor.next(t);
    return this.pos += (n.length + t) * e, this.value = n.length <= i ? n : e < 0 ? n.slice(n.length - i) : n.slice(0, i), this.done = !this.value, this;
  }
  next(t = 0) {
    return t < 0 ? t = Math.max(t, this.from - this.pos) : t > 0 && (t = Math.min(t, this.to - this.pos)), this.nextInner(t, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class mo {
  constructor(t) {
    this.inner = t, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(t = 0) {
    let { done: e, lineBreak: i, value: n } = this.inner.next(t);
    return e ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = n, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (V.prototype[Symbol.iterator] = function() {
  return this.iter();
}, qe.prototype[Symbol.iterator] = go.prototype[Symbol.iterator] = mo.prototype[Symbol.iterator] = function() {
  return this;
});
class xa {
  /**
  @internal
  */
  constructor(t, e, i, n) {
    this.from = t, this.to = e, this.number = i, this.text = n;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
let Ce = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
for (let s = 1; s < Ce.length; s++)
  Ce[s] += Ce[s - 1];
function va(s) {
  for (let t = 1; t < Ce.length; t += 2)
    if (Ce[t] > s)
      return Ce[t - 1] <= s;
  return !1;
}
function Hs(s) {
  return s >= 127462 && s <= 127487;
}
const Fs = 8205;
function Vt(s, t, e = !0, i = !0) {
  return (e ? yo : ka)(s, t, i);
}
function yo(s, t, e) {
  if (t == s.length)
    return t;
  t && bo(s.charCodeAt(t)) && wo(s.charCodeAt(t - 1)) && t--;
  let i = ot(s, t);
  for (t += Dt(i); t < s.length; ) {
    let n = ot(s, t);
    if (i == Fs || n == Fs || e && va(n))
      t += Dt(n), i = n;
    else if (Hs(n)) {
      let r = 0, o = t - 2;
      for (; o >= 0 && Hs(ot(s, o)); )
        r++, o -= 2;
      if (r % 2 == 0)
        break;
      t += 2;
    } else
      break;
  }
  return t;
}
function ka(s, t, e) {
  for (; t > 0; ) {
    let i = yo(s, t - 2, e);
    if (i < t)
      return i;
    t--;
  }
  return 0;
}
function bo(s) {
  return s >= 56320 && s < 57344;
}
function wo(s) {
  return s >= 55296 && s < 56320;
}
function ot(s, t) {
  let e = s.charCodeAt(t);
  if (!wo(e) || t + 1 == s.length)
    return e;
  let i = s.charCodeAt(t + 1);
  return bo(i) ? (e - 55296 << 10) + (i - 56320) + 65536 : e;
}
function xo(s) {
  return s <= 65535 ? String.fromCharCode(s) : (s -= 65536, String.fromCharCode((s >> 10) + 55296, (s & 1023) + 56320));
}
function Dt(s) {
  return s < 65536 ? 1 : 2;
}
const An = /\r\n?|\n/;
var st = /* @__PURE__ */ function(s) {
  return s[s.Simple = 0] = "Simple", s[s.TrackDel = 1] = "TrackDel", s[s.TrackBefore = 2] = "TrackBefore", s[s.TrackAfter = 3] = "TrackAfter", s;
}(st || (st = {}));
class jt {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(t) {
    this.sections = t;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let t = 0;
    for (let e = 0; e < this.sections.length; e += 2)
      t += this.sections[e];
    return t;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let t = 0;
    for (let e = 0; e < this.sections.length; e += 2) {
      let i = this.sections[e + 1];
      t += i < 0 ? this.sections[e] : i;
    }
    return t;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(t) {
    for (let e = 0, i = 0, n = 0; e < this.sections.length; ) {
      let r = this.sections[e++], o = this.sections[e++];
      o < 0 ? (t(i, n, r), n += r) : n += o, i += r;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(t, e = !1) {
    Mn(this, t, e);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let t = [];
    for (let e = 0; e < this.sections.length; ) {
      let i = this.sections[e++], n = this.sections[e++];
      n < 0 ? t.push(i, n) : t.push(n, i);
    }
    return new jt(t);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(t) {
    return this.empty ? t : t.empty ? this : vo(this, t);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `other` happened before the ones in `this`.
  */
  mapDesc(t, e = !1) {
    return t.empty ? this : On(this, t, e);
  }
  mapPos(t, e = -1, i = st.Simple) {
    let n = 0, r = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], a = this.sections[o++], h = n + l;
      if (a < 0) {
        if (h > t)
          return r + (t - n);
        r += l;
      } else {
        if (i != st.Simple && h >= t && (i == st.TrackDel && n < t && h > t || i == st.TrackBefore && n < t || i == st.TrackAfter && h > t))
          return null;
        if (h > t || h == t && e < 0 && !l)
          return t == n || e < 0 ? r : r + a;
        r += a;
      }
      n = h;
    }
    if (t > n)
      throw new RangeError(`Position ${t} is out of range for changeset of length ${n}`);
    return r;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(t, e = t) {
    for (let i = 0, n = 0; i < this.sections.length && n <= e; ) {
      let r = this.sections[i++], o = this.sections[i++], l = n + r;
      if (o >= 0 && n <= e && l >= t)
        return n < t && l > e ? "cover" : !0;
      n = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let t = "";
    for (let e = 0; e < this.sections.length; ) {
      let i = this.sections[e++], n = this.sections[e++];
      t += (t ? " " : "") + i + (n >= 0 ? ":" + n : "");
    }
    return t;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(t) {
    if (!Array.isArray(t) || t.length % 2 || t.some((e) => typeof e != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new jt(t);
  }
  /**
  @internal
  */
  static create(t) {
    return new jt(t);
  }
}
class Z extends jt {
  constructor(t, e) {
    super(t), this.inserted = e;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(t) {
    if (this.length != t.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Mn(this, (e, i, n, r, o) => t = t.replace(n, n + (i - e), o), !1), t;
  }
  mapDesc(t, e = !1) {
    return On(this, t, e, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(t) {
    let e = this.sections.slice(), i = [];
    for (let n = 0, r = 0; n < e.length; n += 2) {
      let o = e[n], l = e[n + 1];
      if (l >= 0) {
        e[n] = l, e[n + 1] = o;
        let a = n >> 1;
        for (; i.length < a; )
          i.push(V.empty);
        i.push(o ? t.slice(r, r + o) : V.empty);
      }
      r += o;
    }
    return new Z(e, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(t) {
    return this.empty ? t : t.empty ? this : vo(this, t, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(t, e = !1) {
    return t.empty ? this : On(this, t, e, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(t, e = !1) {
    Mn(this, t, e);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return jt.create(this.sections);
  }
  /**
  @internal
  */
  filter(t) {
    let e = [], i = [], n = [], r = new Ue(this);
    t: for (let o = 0, l = 0; ; ) {
      let a = o == t.length ? 1e9 : t[o++];
      for (; l < a || l == a && r.len == 0; ) {
        if (r.done)
          break t;
        let f = Math.min(r.len, a - l);
        rt(n, f, -1);
        let c = r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0;
        rt(e, f, c), c > 0 && Yt(i, e, r.text), r.forward(f), l += f;
      }
      let h = t[o++];
      for (; l < h; ) {
        if (r.done)
          break t;
        let f = Math.min(r.len, h - l);
        rt(e, f, -1), rt(n, f, r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0), r.forward(f), l += f;
      }
    }
    return {
      changes: new Z(e, i),
      filtered: jt.create(n)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let t = [];
    for (let e = 0; e < this.sections.length; e += 2) {
      let i = this.sections[e], n = this.sections[e + 1];
      n < 0 ? t.push(i) : n == 0 ? t.push([i]) : t.push([i].concat(this.inserted[e >> 1].toJSON()));
    }
    return t;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(t, e, i) {
    let n = [], r = [], o = 0, l = null;
    function a(f = !1) {
      if (!f && !n.length)
        return;
      o < e && rt(n, e - o, -1);
      let c = new Z(n, r);
      l = l ? l.compose(c.map(l)) : c, n = [], r = [], o = 0;
    }
    function h(f) {
      if (Array.isArray(f))
        for (let c of f)
          h(c);
      else if (f instanceof Z) {
        if (f.length != e)
          throw new RangeError(`Mismatched change set length (got ${f.length}, expected ${e})`);
        a(), l = l ? l.compose(f.map(l)) : f;
      } else {
        let { from: c, to: u = c, insert: d } = f;
        if (c > u || c < 0 || u > e)
          throw new RangeError(`Invalid change range ${c} to ${u} (in doc of length ${e})`);
        let p = d ? typeof d == "string" ? V.of(d.split(i || An)) : d : V.empty, g = p.length;
        if (c == u && g == 0)
          return;
        c < o && a(), c > o && rt(n, c - o, -1), rt(n, u - c, g), Yt(r, n, p), o = u;
      }
    }
    return h(t), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(t) {
    return new Z(t ? [t, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(t) {
    if (!Array.isArray(t))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let e = [], i = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (typeof r == "number")
        e.push(r, -1);
      else {
        if (!Array.isArray(r) || typeof r[0] != "number" || r.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (r.length == 1)
          e.push(r[0], 0);
        else {
          for (; i.length < n; )
            i.push(V.empty);
          i[n] = V.of(r.slice(1)), e.push(r[0], i[n].length);
        }
      }
    }
    return new Z(e, i);
  }
  /**
  @internal
  */
  static createSet(t, e) {
    return new Z(t, e);
  }
}
function rt(s, t, e, i = !1) {
  if (t == 0 && e <= 0)
    return;
  let n = s.length - 2;
  n >= 0 && e <= 0 && e == s[n + 1] ? s[n] += t : t == 0 && s[n] == 0 ? s[n + 1] += e : i ? (s[n] += t, s[n + 1] += e) : s.push(t, e);
}
function Yt(s, t, e) {
  if (e.length == 0)
    return;
  let i = t.length - 2 >> 1;
  if (i < s.length)
    s[s.length - 1] = s[s.length - 1].append(e);
  else {
    for (; s.length < i; )
      s.push(V.empty);
    s.push(e);
  }
}
function Mn(s, t, e) {
  let i = s.inserted;
  for (let n = 0, r = 0, o = 0; o < s.sections.length; ) {
    let l = s.sections[o++], a = s.sections[o++];
    if (a < 0)
      n += l, r += l;
    else {
      let h = n, f = r, c = V.empty;
      for (; h += l, f += a, a && i && (c = c.append(i[o - 2 >> 1])), !(e || o == s.sections.length || s.sections[o + 1] < 0); )
        l = s.sections[o++], a = s.sections[o++];
      t(n, h, r, f, c), n = h, r = f;
    }
  }
}
function On(s, t, e, i = !1) {
  let n = [], r = i ? [] : null, o = new Ue(s), l = new Ue(t);
  for (let a = -1; ; )
    if (o.ins == -1 && l.ins == -1) {
      let h = Math.min(o.len, l.len);
      rt(n, h, -1), o.forward(h), l.forward(h);
    } else if (l.ins >= 0 && (o.ins < 0 || a == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !e))) {
      let h = l.len;
      for (rt(n, l.ins, -1); h; ) {
        let f = Math.min(o.len, h);
        o.ins >= 0 && a < o.i && o.len <= f && (rt(n, 0, o.ins), r && Yt(r, n, o.text), a = o.i), o.forward(f), h -= f;
      }
      l.next();
    } else if (o.ins >= 0) {
      let h = 0, f = o.len;
      for (; f; )
        if (l.ins == -1) {
          let c = Math.min(f, l.len);
          h += c, f -= c, l.forward(c);
        } else if (l.ins == 0 && l.len < f)
          f -= l.len, l.next();
        else
          break;
      rt(n, h, a < o.i ? o.ins : 0), r && a < o.i && Yt(r, n, o.text), a = o.i, o.forward(o.len - f);
    } else {
      if (o.done && l.done)
        return r ? Z.createSet(n, r) : jt.create(n);
      throw new Error("Mismatched change set lengths");
    }
}
function vo(s, t, e = !1) {
  let i = [], n = e ? [] : null, r = new Ue(s), o = new Ue(t);
  for (let l = !1; ; ) {
    if (r.done && o.done)
      return n ? Z.createSet(i, n) : jt.create(i);
    if (r.ins == 0)
      rt(i, r.len, 0, l), r.next();
    else if (o.len == 0 && !o.done)
      rt(i, 0, o.ins, l), n && Yt(n, i, o.text), o.next();
    else {
      if (r.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(r.len2, o.len), h = i.length;
        if (r.ins == -1) {
          let f = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          rt(i, a, f, l), n && f && Yt(n, i, o.text);
        } else o.ins == -1 ? (rt(i, r.off ? 0 : r.len, a, l), n && Yt(n, i, r.textBit(a))) : (rt(i, r.off ? 0 : r.len, o.off ? 0 : o.ins, l), n && !o.off && Yt(n, i, o.text));
        l = (r.ins > a || o.ins >= 0 && o.len > a) && (l || i.length > h), r.forward2(a), o.forward(a);
      }
    }
  }
}
class Ue {
  constructor(t) {
    this.set = t, this.i = 0, this.next();
  }
  next() {
    let { sections: t } = this.set;
    this.i < t.length ? (this.len = t[this.i++], this.ins = t[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: t } = this.set, e = this.i - 2 >> 1;
    return e >= t.length ? V.empty : t[e];
  }
  textBit(t) {
    let { inserted: e } = this.set, i = this.i - 2 >> 1;
    return i >= e.length && !t ? V.empty : e[i].slice(this.off, t == null ? void 0 : this.off + t);
  }
  forward(t) {
    t == this.len ? this.next() : (this.len -= t, this.off += t);
  }
  forward2(t) {
    this.ins == -1 ? this.forward(t) : t == this.ins ? this.next() : (this.ins -= t, this.off += t);
  }
}
class fe {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.flags = i;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 16 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 16 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let t = this.flags & 3;
    return t == 3 ? null : t;
  }
  /**
  The goal column (stored vertical offset) associated with a
  cursor. This is used to preserve the vertical position when
  [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
  lines of different length.
  */
  get goalColumn() {
    let t = this.flags >> 5;
    return t == 33554431 ? void 0 : t;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(t, e = -1) {
    let i, n;
    return this.empty ? i = n = t.mapPos(this.from, e) : (i = t.mapPos(this.from, 1), n = t.mapPos(this.to, -1)), i == this.from && n == this.to ? this : new fe(i, n, this.flags);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(t, e = t) {
    if (t <= this.anchor && e >= this.anchor)
      return v.range(t, e);
    let i = Math.abs(t - this.anchor) > Math.abs(e - this.anchor) ? t : e;
    return v.range(this.anchor, i);
  }
  /**
  Compare this range to another range.
  */
  eq(t) {
    return this.anchor == t.anchor && this.head == t.head;
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(t) {
    if (!t || typeof t.anchor != "number" || typeof t.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return v.range(t.anchor, t.head);
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new fe(t, e, i);
  }
}
class v {
  constructor(t, e) {
    this.ranges = t, this.mainIndex = e;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(t, e = -1) {
    return t.empty ? this : v.create(this.ranges.map((i) => i.map(t, e)), this.mainIndex);
  }
  /**
  Compare this selection to another selection.
  */
  eq(t) {
    if (this.ranges.length != t.ranges.length || this.mainIndex != t.mainIndex)
      return !1;
    for (let e = 0; e < this.ranges.length; e++)
      if (!this.ranges[e].eq(t.ranges[e]))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new v([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(t, e = !0) {
    return v.create([t].concat(this.ranges), e ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(t, e = this.mainIndex) {
    let i = this.ranges.slice();
    return i[e] = t, v.create(i, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((t) => t.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(t) {
    if (!t || !Array.isArray(t.ranges) || typeof t.main != "number" || t.main >= t.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new v(t.ranges.map((e) => fe.fromJSON(e)), t.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(t, e = t) {
    return new v([v.range(t, e)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(t, e = 0) {
    if (t.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, n = 0; n < t.length; n++) {
      let r = t[n];
      if (r.empty ? r.from <= i : r.from < i)
        return v.normalized(t.slice(), e);
      i = r.to;
    }
    return new v(t, e);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(t, e = 0, i, n) {
    return fe.create(t, t, (e == 0 ? 0 : e < 0 ? 4 : 8) | (i == null ? 3 : Math.min(2, i)) | (n ?? 33554431) << 5);
  }
  /**
  Create a selection range.
  */
  static range(t, e, i, n) {
    let r = (i ?? 33554431) << 5 | (n == null ? 3 : Math.min(2, n));
    return e < t ? fe.create(e, t, 24 | r) : fe.create(t, e, (e > t ? 4 : 0) | r);
  }
  /**
  @internal
  */
  static normalized(t, e = 0) {
    let i = t[e];
    t.sort((n, r) => n.from - r.from), e = t.indexOf(i);
    for (let n = 1; n < t.length; n++) {
      let r = t[n], o = t[n - 1];
      if (r.empty ? r.from <= o.to : r.from < o.to) {
        let l = o.from, a = Math.max(r.to, o.to);
        n <= e && e--, t.splice(--n, 2, r.anchor > r.head ? v.range(a, l) : v.range(l, a));
      }
    }
    return new v(t, e);
  }
}
function ko(s, t) {
  for (let e of s.ranges)
    if (e.to > t)
      throw new RangeError("Selection points outside of document");
}
let ds = 0;
class D {
  constructor(t, e, i, n, r) {
    this.combine = t, this.compareInput = e, this.compare = i, this.isStatic = n, this.id = ds++, this.default = t([]), this.extensions = typeof r == "function" ? r(this) : r;
  }
  /**
  Define a new facet.
  */
  static define(t = {}) {
    return new D(t.combine || ((e) => e), t.compareInput || ((e, i) => e === i), t.compare || (t.combine ? (e, i) => e === i : ps), !!t.static, t.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(t) {
    return new Di([], this, 0, t);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(t, e) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Di(t, this, 1, e);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(t, e) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Di(t, this, 2, e);
  }
  from(t, e) {
    return e || (e = (i) => i), this.compute([t], (i) => e(i.field(t)));
  }
}
function ps(s, t) {
  return s == t || s.length == t.length && s.every((e, i) => e === t[i]);
}
class Di {
  constructor(t, e, i, n) {
    this.dependencies = t, this.facet = e, this.type = i, this.value = n, this.id = ds++;
  }
  dynamicSlot(t) {
    var e;
    let i = this.value, n = this.facet.compareInput, r = this.id, o = t[r] >> 1, l = this.type == 2, a = !1, h = !1, f = [];
    for (let c of this.dependencies)
      c == "doc" ? a = !0 : c == "selection" ? h = !0 : ((e = t[c.id]) !== null && e !== void 0 ? e : 1) & 1 || f.push(t[c.id]);
    return {
      create(c) {
        return c.values[o] = i(c), 1;
      },
      update(c, u) {
        if (a && u.docChanged || h && (u.docChanged || u.selection) || Dn(c, f)) {
          let d = i(c);
          if (l ? !Vs(d, c.values[o], n) : !n(d, c.values[o]))
            return c.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (c, u) => {
        let d, p = u.config.address[r];
        if (p != null) {
          let g = Hi(u, p);
          if (this.dependencies.every((m) => m instanceof D ? u.facet(m) === c.facet(m) : m instanceof yt ? u.field(m, !1) == c.field(m, !1) : !0) || (l ? Vs(d = i(c), g, n) : n(d = i(c), g)))
            return c.values[o] = g, 0;
        } else
          d = i(c);
        return c.values[o] = d, 1;
      }
    };
  }
}
function Vs(s, t, e) {
  if (s.length != t.length)
    return !1;
  for (let i = 0; i < s.length; i++)
    if (!e(s[i], t[i]))
      return !1;
  return !0;
}
function Dn(s, t) {
  let e = !1;
  for (let i of t)
    je(s, i) & 1 && (e = !0);
  return e;
}
function Sa(s, t, e) {
  let i = e.map((a) => s[a.id]), n = e.map((a) => a.type), r = i.filter((a) => !(a & 1)), o = s[t.id] >> 1;
  function l(a) {
    let h = [];
    for (let f = 0; f < i.length; f++) {
      let c = Hi(a, i[f]);
      if (n[f] == 2)
        for (let u of c)
          h.push(u);
      else
        h.push(c);
    }
    return t.combine(h);
  }
  return {
    create(a) {
      for (let h of i)
        je(a, h);
      return a.values[o] = l(a), 1;
    },
    update(a, h) {
      if (!Dn(a, r))
        return 0;
      let f = l(a);
      return t.compare(f, a.values[o]) ? 0 : (a.values[o] = f, 1);
    },
    reconfigure(a, h) {
      let f = Dn(a, i), c = h.config.facets[t.id], u = h.facet(t);
      if (c && !f && ps(e, c))
        return a.values[o] = u, 0;
      let d = l(a);
      return t.compare(d, u) ? (a.values[o] = u, 0) : (a.values[o] = d, 1);
    }
  };
}
const Ws = /* @__PURE__ */ D.define({ static: !0 });
class yt {
  constructor(t, e, i, n, r) {
    this.id = t, this.createF = e, this.updateF = i, this.compareF = n, this.spec = r, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(t) {
    let e = new yt(ds++, t.create, t.update, t.compare || ((i, n) => i === n), t);
    return t.provide && (e.provides = t.provide(e)), e;
  }
  create(t) {
    let e = t.facet(Ws).find((i) => i.field == this);
    return ((e == null ? void 0 : e.create) || this.createF)(t);
  }
  /**
  @internal
  */
  slot(t) {
    let e = t[this.id] >> 1;
    return {
      create: (i) => (i.values[e] = this.create(i), 1),
      update: (i, n) => {
        let r = i.values[e], o = this.updateF(r, n);
        return this.compareF(r, o) ? 0 : (i.values[e] = o, 1);
      },
      reconfigure: (i, n) => n.config.address[this.id] != null ? (i.values[e] = n.field(this), 0) : (i.values[e] = this.create(i), 1)
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(t) {
    return [this, Ws.of({ field: this, create: t })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const he = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function Le(s) {
  return (t) => new So(t, s);
}
const Be = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ Le(he.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ Le(he.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ Le(he.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ Le(he.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ Le(he.lowest)
};
class So {
  constructor(t, e) {
    this.inner = t, this.prec = e;
  }
}
class Qi {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(t) {
    return new Tn(this, t);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(t) {
    return Qi.reconfigure.of({ compartment: this, extension: t });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(t) {
    return t.config.compartments.get(this);
  }
}
class Tn {
  constructor(t, e) {
    this.compartment = t, this.inner = e;
  }
}
class Ni {
  constructor(t, e, i, n, r, o) {
    for (this.base = t, this.compartments = e, this.dynamicSlots = i, this.address = n, this.staticValues = r, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(t) {
    let e = this.address[t.id];
    return e == null ? t.default : this.staticValues[e >> 1];
  }
  static resolve(t, e, i) {
    let n = [], r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let u of Ca(t, e, o))
      u instanceof yt ? n.push(u) : (r[u.facet.id] || (r[u.facet.id] = [])).push(u);
    let l = /* @__PURE__ */ Object.create(null), a = [], h = [];
    for (let u of n)
      l[u.id] = h.length << 1, h.push((d) => u.slot(d));
    let f = i == null ? void 0 : i.config.facets;
    for (let u in r) {
      let d = r[u], p = d[0].facet, g = f && f[u] || [];
      if (d.every(
        (m) => m.type == 0
        /* Provider.Static */
      ))
        if (l[p.id] = a.length << 1 | 1, ps(g, d))
          a.push(i.facet(p));
        else {
          let m = p.combine(d.map((y) => y.value));
          a.push(i && p.compare(m, i.facet(p)) ? i.facet(p) : m);
        }
      else {
        for (let m of d)
          m.type == 0 ? (l[m.id] = a.length << 1 | 1, a.push(m.value)) : (l[m.id] = h.length << 1, h.push((y) => m.dynamicSlot(y)));
        l[p.id] = h.length << 1, h.push((m) => Sa(m, p, d));
      }
    }
    let c = h.map((u) => u(l));
    return new Ni(t, o, c, l, a, r);
  }
}
function Ca(s, t, e) {
  let i = [[], [], [], [], []], n = /* @__PURE__ */ new Map();
  function r(o, l) {
    let a = n.get(o);
    if (a != null) {
      if (a <= l)
        return;
      let h = i[a].indexOf(o);
      h > -1 && i[a].splice(h, 1), o instanceof Tn && e.delete(o.compartment);
    }
    if (n.set(o, l), Array.isArray(o))
      for (let h of o)
        r(h, l);
    else if (o instanceof Tn) {
      if (e.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let h = t.get(o.compartment) || o.inner;
      e.set(o.compartment, h), r(h, l);
    } else if (o instanceof So)
      r(o.inner, o.prec);
    else if (o instanceof yt)
      i[l].push(o), o.provides && r(o.provides, l);
    else if (o instanceof Di)
      i[l].push(o), o.facet.extensions && r(o.facet.extensions, he.default);
    else {
      let h = o.extension;
      if (!h)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      r(h, l);
    }
  }
  return r(s, he.default), i.reduce((o, l) => o.concat(l));
}
function je(s, t) {
  if (t & 1)
    return 2;
  let e = t >> 1, i = s.status[e];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  s.status[e] = 4;
  let n = s.computeSlot(s, s.config.dynamicSlots[e]);
  return s.status[e] = 2 | n;
}
function Hi(s, t) {
  return t & 1 ? s.config.staticValues[t >> 1] : s.values[t >> 1];
}
const Co = /* @__PURE__ */ D.define(), Ao = /* @__PURE__ */ D.define({
  combine: (s) => s.some((t) => t),
  static: !0
}), Mo = /* @__PURE__ */ D.define({
  combine: (s) => s.length ? s[0] : void 0,
  static: !0
}), Oo = /* @__PURE__ */ D.define(), Do = /* @__PURE__ */ D.define(), To = /* @__PURE__ */ D.define(), Po = /* @__PURE__ */ D.define({
  combine: (s) => s.length ? s[0] : !1
});
class ye {
  /**
  @internal
  */
  constructor(t, e) {
    this.type = t, this.value = e;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new Aa();
  }
}
class Aa {
  /**
  Create an instance of this annotation.
  */
  of(t) {
    return new ye(this, t);
  }
}
class Ma {
  /**
  @internal
  */
  constructor(t) {
    this.map = t;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(t) {
    return new L(this, t);
  }
}
class L {
  /**
  @internal
  */
  constructor(t, e) {
    this.type = t, this.value = e;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(t) {
    let e = this.type.map(this.value, t);
    return e === void 0 ? void 0 : e == this.value ? this : new L(this.type, e);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(t) {
    return this.type == t;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(t = {}) {
    return new Ma(t.map || ((e) => e));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(t, e) {
    if (!t.length)
      return t;
    let i = [];
    for (let n of t) {
      let r = n.map(e);
      r && i.push(r);
    }
    return i;
  }
}
L.reconfigure = /* @__PURE__ */ L.define();
L.appendConfig = /* @__PURE__ */ L.define();
class lt {
  constructor(t, e, i, n, r, o) {
    this.startState = t, this.changes = e, this.selection = i, this.effects = n, this.annotations = r, this.scrollIntoView = o, this._doc = null, this._state = null, i && ko(i, e.newLength), r.some((l) => l.type == lt.time) || (this.annotations = r.concat(lt.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(t, e, i, n, r, o) {
    return new lt(t, e, i, n, r, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(t) {
    for (let e of this.annotations)
      if (e.type == t)
        return e.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(t) {
    let e = this.annotation(lt.userEvent);
    return !!(e && (e == t || e.length > t.length && e.slice(0, t.length) == t && e[t.length] == "."));
  }
}
lt.time = /* @__PURE__ */ ye.define();
lt.userEvent = /* @__PURE__ */ ye.define();
lt.addToHistory = /* @__PURE__ */ ye.define();
lt.remote = /* @__PURE__ */ ye.define();
function Oa(s, t) {
  let e = [];
  for (let i = 0, n = 0; ; ) {
    let r, o;
    if (i < s.length && (n == t.length || t[n] >= s[i]))
      r = s[i++], o = s[i++];
    else if (n < t.length)
      r = t[n++], o = t[n++];
    else
      return e;
    !e.length || e[e.length - 1] < r ? e.push(r, o) : e[e.length - 1] < o && (e[e.length - 1] = o);
  }
}
function Bo(s, t, e) {
  var i;
  let n, r, o;
  return e ? (n = t.changes, r = Z.empty(t.changes.length), o = s.changes.compose(t.changes)) : (n = t.changes.map(s.changes), r = s.changes.mapDesc(t.changes, !0), o = s.changes.compose(n)), {
    changes: o,
    selection: t.selection ? t.selection.map(r) : (i = s.selection) === null || i === void 0 ? void 0 : i.map(n),
    effects: L.mapEffects(s.effects, n).concat(L.mapEffects(t.effects, r)),
    annotations: s.annotations.length ? s.annotations.concat(t.annotations) : t.annotations,
    scrollIntoView: s.scrollIntoView || t.scrollIntoView
  };
}
function Pn(s, t, e) {
  let i = t.selection, n = Ae(t.annotations);
  return t.userEvent && (n = n.concat(lt.userEvent.of(t.userEvent))), {
    changes: t.changes instanceof Z ? t.changes : Z.of(t.changes || [], e, s.facet(Mo)),
    selection: i && (i instanceof v ? i : v.single(i.anchor, i.head)),
    effects: Ae(t.effects),
    annotations: n,
    scrollIntoView: !!t.scrollIntoView
  };
}
function Ro(s, t, e) {
  let i = Pn(s, t.length ? t[0] : {}, s.doc.length);
  t.length && t[0].filter === !1 && (e = !1);
  for (let r = 1; r < t.length; r++) {
    t[r].filter === !1 && (e = !1);
    let o = !!t[r].sequential;
    i = Bo(i, Pn(s, t[r], o ? i.changes.newLength : s.doc.length), o);
  }
  let n = lt.create(s, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return Ta(e ? Da(n) : n);
}
function Da(s) {
  let t = s.startState, e = !0;
  for (let n of t.facet(Oo)) {
    let r = n(s);
    if (r === !1) {
      e = !1;
      break;
    }
    Array.isArray(r) && (e = e === !0 ? r : Oa(e, r));
  }
  if (e !== !0) {
    let n, r;
    if (e === !1)
      r = s.changes.invertedDesc, n = Z.empty(t.doc.length);
    else {
      let o = s.changes.filter(e);
      n = o.changes, r = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    s = lt.create(t, n, s.selection && s.selection.map(r), L.mapEffects(s.effects, r), s.annotations, s.scrollIntoView);
  }
  let i = t.facet(Do);
  for (let n = i.length - 1; n >= 0; n--) {
    let r = i[n](s);
    r instanceof lt ? s = r : Array.isArray(r) && r.length == 1 && r[0] instanceof lt ? s = r[0] : s = Ro(t, Ae(r), !1);
  }
  return s;
}
function Ta(s) {
  let t = s.startState, e = t.facet(To), i = s;
  for (let n = e.length - 1; n >= 0; n--) {
    let r = e[n](s);
    r && Object.keys(r).length && (i = Bo(i, Pn(t, r, s.changes.newLength), !0));
  }
  return i == s ? s : lt.create(t, s.changes, s.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Pa = [];
function Ae(s) {
  return s == null ? Pa : Array.isArray(s) ? s : [s];
}
var Ct = /* @__PURE__ */ function(s) {
  return s[s.Word = 0] = "Word", s[s.Space = 1] = "Space", s[s.Other = 2] = "Other", s;
}(Ct || (Ct = {}));
const Ba = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Bn;
try {
  Bn = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Ra(s) {
  if (Bn)
    return Bn.test(s);
  for (let t = 0; t < s.length; t++) {
    let e = s[t];
    if (/\w/.test(e) || e > "" && (e.toUpperCase() != e.toLowerCase() || Ba.test(e)))
      return !0;
  }
  return !1;
}
function Ea(s) {
  return (t) => {
    if (!/\S/.test(t))
      return Ct.Space;
    if (Ra(t))
      return Ct.Word;
    for (let e = 0; e < s.length; e++)
      if (t.indexOf(s[e]) > -1)
        return Ct.Word;
    return Ct.Other;
  };
}
class F {
  constructor(t, e, i, n, r, o) {
    this.config = t, this.doc = e, this.selection = i, this.values = n, this.status = t.statusTemplate.slice(), this.computeSlot = r, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      je(this, l << 1);
    this.computeSlot = null;
  }
  field(t, e = !0) {
    let i = this.config.address[t.id];
    if (i == null) {
      if (e)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return je(this, i), Hi(this, i);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...t) {
    return Ro(this, t, !0);
  }
  /**
  @internal
  */
  applyTransaction(t) {
    let e = this.config, { base: i, compartments: n } = e;
    for (let o of t.effects)
      o.is(Qi.reconfigure) ? (e && (n = /* @__PURE__ */ new Map(), e.compartments.forEach((l, a) => n.set(a, l)), e = null), n.set(o.value.compartment, o.value.extension)) : o.is(L.reconfigure) ? (e = null, i = o.value) : o.is(L.appendConfig) && (e = null, i = Ae(i).concat(o.value));
    let r;
    e ? r = t.startState.values.slice() : (e = Ni.resolve(i, n, this), r = new F(e, this.doc, this.selection, e.dynamicSlots.map(() => null), (l, a) => a.reconfigure(l, this), null).values), new F(e, t.newDoc, t.newSelection, r, (o, l) => l.update(o, t), t);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(t) {
    return typeof t == "string" && (t = this.toText(t)), this.changeByRange((e) => ({
      changes: { from: e.from, to: e.to, insert: t },
      range: v.cursor(e.from + t.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(t) {
    let e = this.selection, i = t(e.ranges[0]), n = this.changes(i.changes), r = [i.range], o = Ae(i.effects);
    for (let l = 1; l < e.ranges.length; l++) {
      let a = t(e.ranges[l]), h = this.changes(a.changes), f = h.map(n);
      for (let u = 0; u < l; u++)
        r[u] = r[u].map(f);
      let c = n.mapDesc(h, !0);
      r.push(a.range.map(c)), n = n.compose(f), o = L.mapEffects(o, f).concat(L.mapEffects(Ae(a.effects), c));
    }
    return {
      changes: n,
      selection: v.create(r, e.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(t = []) {
    return t instanceof Z ? t : Z.of(t, this.doc.length, this.facet(F.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(t) {
    return V.of(t.split(this.facet(F.lineSeparator) || An));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(t = 0, e = this.doc.length) {
    return this.doc.sliceString(t, e, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(t) {
    let e = this.config.address[t.id];
    return e == null ? t.default : (je(this, e), Hi(this, e));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(t) {
    let e = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (t)
      for (let i in t) {
        let n = t[i];
        n instanceof yt && this.config.address[n.id] != null && (e[i] = n.spec.toJSON(this.field(t[i]), this));
      }
    return e;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(t, e = {}, i) {
    if (!t || typeof t.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let n = [];
    if (i) {
      for (let r in i)
        if (Object.prototype.hasOwnProperty.call(t, r)) {
          let o = i[r], l = t[r];
          n.push(o.init((a) => o.spec.fromJSON(l, a)));
        }
    }
    return F.create({
      doc: t.doc,
      selection: v.fromJSON(t.selection),
      extensions: e.extensions ? n.concat([e.extensions]) : n
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(t = {}) {
    let e = Ni.resolve(t.extensions || [], /* @__PURE__ */ new Map()), i = t.doc instanceof V ? t.doc : V.of((t.doc || "").split(e.staticFacet(F.lineSeparator) || An)), n = t.selection ? t.selection instanceof v ? t.selection : v.single(t.selection.anchor, t.selection.head) : v.single(0);
    return ko(n, i.length), e.staticFacet(Ao) || (n = n.asSingle()), new F(e, i, n, e.dynamicSlots.map(() => null), (r, o) => o.create(r), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(F.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(F.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(Po);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(t, ...e) {
    for (let i of this.facet(F.phrases))
      if (Object.prototype.hasOwnProperty.call(i, t)) {
        t = i[t];
        break;
      }
    return e.length && (t = t.replace(/\$(\$|\d*)/g, (i, n) => {
      if (n == "$")
        return "$";
      let r = +(n || 1);
      return !r || r > e.length ? i : e[r - 1];
    })), t;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(t, e, i = -1) {
    let n = [];
    for (let r of this.facet(Co))
      for (let o of r(this, e, i))
        Object.prototype.hasOwnProperty.call(o, t) && n.push(o[t]);
    return n;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(t) {
    return Ea(this.languageDataAt("wordChars", t).join(""));
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(t) {
    let { text: e, from: i, length: n } = this.doc.lineAt(t), r = this.charCategorizer(t), o = t - i, l = t - i;
    for (; o > 0; ) {
      let a = Vt(e, o, !1);
      if (r(e.slice(a, o)) != Ct.Word)
        break;
      o = a;
    }
    for (; l < n; ) {
      let a = Vt(e, l);
      if (r(e.slice(l, a)) != Ct.Word)
        break;
      l = a;
    }
    return o == l ? null : v.range(o + i, l + i);
  }
}
F.allowMultipleSelections = Ao;
F.tabSize = /* @__PURE__ */ D.define({
  combine: (s) => s.length ? s[0] : 4
});
F.lineSeparator = Mo;
F.readOnly = Po;
F.phrases = /* @__PURE__ */ D.define({
  compare(s, t) {
    let e = Object.keys(s), i = Object.keys(t);
    return e.length == i.length && e.every((n) => s[n] == t[n]);
  }
});
F.languageData = Co;
F.changeFilter = Oo;
F.transactionFilter = Do;
F.transactionExtender = To;
Qi.reconfigure = /* @__PURE__ */ L.define();
function Re(s, t, e = {}) {
  let i = {};
  for (let n of s)
    for (let r of Object.keys(n)) {
      let o = n[r], l = i[r];
      if (l === void 0)
        i[r] = o;
      else if (!(l === o || o === void 0)) if (Object.hasOwnProperty.call(e, r))
        i[r] = e[r](l, o);
      else
        throw new Error("Config merge conflict for field " + r);
    }
  for (let n in t)
    i[n] === void 0 && (i[n] = t[n]);
  return i;
}
class de {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(t) {
    return this == t;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(t, e = t) {
    return Rn.create(t, e, this);
  }
}
de.prototype.startSide = de.prototype.endSide = 0;
de.prototype.point = !1;
de.prototype.mapMode = st.TrackDel;
let Rn = class Eo {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.value = i;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new Eo(t, e, i);
  }
};
function En(s, t) {
  return s.from - t.from || s.value.startSide - t.value.startSide;
}
class gs {
  constructor(t, e, i, n) {
    this.from = t, this.to = e, this.value = i, this.maxPoint = n;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(t, e, i, n = 0) {
    let r = i ? this.to : this.from;
    for (let o = n, l = r.length; ; ) {
      if (o == l)
        return o;
      let a = o + l >> 1, h = r[a] - t || (i ? this.value[a].endSide : this.value[a].startSide) - e;
      if (a == o)
        return h >= 0 ? o : l;
      h >= 0 ? l = a : o = a + 1;
    }
  }
  between(t, e, i, n) {
    for (let r = this.findIndex(e, -1e9, !0), o = this.findIndex(i, 1e9, !1, r); r < o; r++)
      if (n(this.from[r] + t, this.to[r] + t, this.value[r]) === !1)
        return !1;
  }
  map(t, e) {
    let i = [], n = [], r = [], o = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let h = this.value[a], f = this.from[a] + t, c = this.to[a] + t, u, d;
      if (f == c) {
        let p = e.mapPos(f, h.startSide, h.mapMode);
        if (p == null || (u = d = p, h.startSide != h.endSide && (d = e.mapPos(f, h.endSide), d < u)))
          continue;
      } else if (u = e.mapPos(f, h.startSide), d = e.mapPos(c, h.endSide), u > d || u == d && h.startSide > 0 && h.endSide <= 0)
        continue;
      (d - u || h.endSide - h.startSide) < 0 || (o < 0 && (o = u), h.point && (l = Math.max(l, d - u)), i.push(h), n.push(u - o), r.push(d - o));
    }
    return { mapped: i.length ? new gs(n, r, i, l) : null, pos: o };
  }
}
class W {
  constructor(t, e, i, n) {
    this.chunkPos = t, this.chunk = e, this.nextLayer = i, this.maxPoint = n;
  }
  /**
  @internal
  */
  static create(t, e, i, n) {
    return new W(t, e, i, n);
  }
  /**
  @internal
  */
  get length() {
    let t = this.chunk.length - 1;
    return t < 0 ? 0 : Math.max(this.chunkEnd(t), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let t = this.nextLayer.size;
    for (let e of this.chunk)
      t += e.value.length;
    return t;
  }
  /**
  @internal
  */
  chunkEnd(t) {
    return this.chunkPos[t] + this.chunk[t].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(t) {
    let { add: e = [], sort: i = !1, filterFrom: n = 0, filterTo: r = this.length } = t, o = t.filter;
    if (e.length == 0 && !o)
      return this;
    if (i && (e = e.slice().sort(En)), this.isEmpty)
      return e.length ? W.of(e) : this;
    let l = new Lo(this, null, -1).goto(0), a = 0, h = [], f = new pe();
    for (; l.value || a < e.length; )
      if (a < e.length && (l.from - e[a].from || l.startSide - e[a].value.startSide) >= 0) {
        let c = e[a++];
        f.addInner(c.from, c.to, c.value) || h.push(c);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == e.length || this.chunkEnd(l.chunkIndex) < e[a].from) && (!o || n > this.chunkEnd(l.chunkIndex) || r < this.chunkPos[l.chunkIndex]) && f.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || n > l.to || r < l.from || o(l.from, l.to, l.value)) && (f.addInner(l.from, l.to, l.value) || h.push(Rn.create(l.from, l.to, l.value))), l.next());
    return f.finishInner(this.nextLayer.isEmpty && !h.length ? W.empty : this.nextLayer.update({ add: h, filter: o, filterFrom: n, filterTo: r }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(t) {
    if (t.empty || this.isEmpty)
      return this;
    let e = [], i = [], n = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let l = this.chunkPos[o], a = this.chunk[o], h = t.touchesRange(l, l + a.length);
      if (h === !1)
        n = Math.max(n, a.maxPoint), e.push(a), i.push(t.mapPos(l));
      else if (h === !0) {
        let { mapped: f, pos: c } = a.map(l, t);
        f && (n = Math.max(n, f.maxPoint), e.push(f), i.push(c));
      }
    }
    let r = this.nextLayer.map(t);
    return e.length == 0 ? r : new W(i, e, r || W.empty, n);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(t, e, i) {
    if (!this.isEmpty) {
      for (let n = 0; n < this.chunk.length; n++) {
        let r = this.chunkPos[n], o = this.chunk[n];
        if (e >= r && t <= r + o.length && o.between(r, t - r, e - r, i) === !1)
          return;
      }
      this.nextLayer.between(t, e, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(t = 0) {
    return Ge.from([this]).goto(t);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(t, e = 0) {
    return Ge.from(t).goto(e);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(t, e, i, n, r = -1) {
    let o = t.filter((c) => c.maxPoint > 0 || !c.isEmpty && c.maxPoint >= r), l = e.filter((c) => c.maxPoint > 0 || !c.isEmpty && c.maxPoint >= r), a = zs(o, l, i), h = new Ie(o, a, r), f = new Ie(l, a, r);
    i.iterGaps((c, u, d) => qs(h, c, f, u, d, n)), i.empty && i.length == 0 && qs(h, 0, f, 0, 0, n);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(t, e, i = 0, n) {
    n == null && (n = 999999999);
    let r = t.filter((f) => !f.isEmpty && e.indexOf(f) < 0), o = e.filter((f) => !f.isEmpty && t.indexOf(f) < 0);
    if (r.length != o.length)
      return !1;
    if (!r.length)
      return !0;
    let l = zs(r, o), a = new Ie(r, l, 0).goto(i), h = new Ie(o, l, 0).goto(i);
    for (; ; ) {
      if (a.to != h.to || !Ln(a.active, h.active) || a.point && (!h.point || !a.point.eq(h.point)))
        return !1;
      if (a.to > n)
        return !0;
      a.next(), h.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(t, e, i, n, r = -1) {
    let o = new Ie(t, null, r).goto(e), l = e, a = o.openStart;
    for (; ; ) {
      let h = Math.min(o.to, i);
      if (o.point) {
        let f = o.activeForPoint(o.to), c = o.pointFrom < e ? f.length + 1 : Math.min(f.length, a);
        n.point(l, h, o.point, f, c, o.pointRank), a = Math.min(o.openEnd(h), f.length);
      } else h > l && (n.span(l, h, o.active, a), a = o.openEnd(h));
      if (o.to > i)
        return a + (o.point && o.to > i ? 1 : 0);
      l = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(t, e = !1) {
    let i = new pe();
    for (let n of t instanceof Rn ? [t] : e ? La(t) : t)
      i.add(n.from, n.to, n.value);
    return i.finish();
  }
}
W.empty = /* @__PURE__ */ new W([], [], null, -1);
function La(s) {
  if (s.length > 1)
    for (let t = s[0], e = 1; e < s.length; e++) {
      let i = s[e];
      if (En(t, i) > 0)
        return s.slice().sort(En);
      t = i;
    }
  return s;
}
W.empty.nextLayer = W.empty;
class pe {
  finishChunk(t) {
    this.chunks.push(new gs(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, t && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(t, e, i) {
    this.addInner(t, e, i) || (this.nextLayer || (this.nextLayer = new pe())).add(t, e, i);
  }
  /**
  @internal
  */
  addInner(t, e, i) {
    let n = t - this.lastTo || i.startSide - this.last.endSide;
    if (n <= 0 && (t - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return n < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = t), this.from.push(t - this.chunkStart), this.to.push(e - this.chunkStart), this.last = i, this.lastFrom = t, this.lastTo = e, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, e - t)), !0);
  }
  /**
  @internal
  */
  addChunk(t, e) {
    if ((t - this.lastTo || e.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, e.maxPoint), this.chunks.push(e), this.chunkPos.push(t);
    let i = e.value.length - 1;
    return this.last = e.value[i], this.lastFrom = e.from[i] + t, this.lastTo = e.to[i] + t, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(W.empty);
  }
  /**
  @internal
  */
  finishInner(t) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return t;
    let e = W.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(t) : t, this.setMaxPoint);
    return this.from = null, e;
  }
}
function zs(s, t, e) {
  let i = /* @__PURE__ */ new Map();
  for (let r of s)
    for (let o = 0; o < r.chunk.length; o++)
      r.chunk[o].maxPoint <= 0 && i.set(r.chunk[o], r.chunkPos[o]);
  let n = /* @__PURE__ */ new Set();
  for (let r of t)
    for (let o = 0; o < r.chunk.length; o++) {
      let l = i.get(r.chunk[o]);
      l != null && (e ? e.mapPos(l) : l) == r.chunkPos[o] && !(e != null && e.touchesRange(l, l + r.chunk[o].length)) && n.add(r.chunk[o]);
    }
  return n;
}
class Lo {
  constructor(t, e, i, n = 0) {
    this.layer = t, this.skip = e, this.minPoint = i, this.rank = n;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(t, e = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(t, e, !1), this;
  }
  gotoInner(t, e, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let n = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(n) || this.layer.chunkEnd(this.chunkIndex) < t || n.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let n = this.layer.chunk[this.chunkIndex].findIndex(t - this.layer.chunkPos[this.chunkIndex], e, !0);
      (!i || this.rangeIndex < n) && this.setRangeIndex(n);
    }
    this.next();
  }
  forward(t, e) {
    (this.to - t || this.endSide - e) < 0 && this.gotoInner(t, e, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let t = this.layer.chunkPos[this.chunkIndex], e = this.layer.chunk[this.chunkIndex], i = t + e.from[this.rangeIndex];
        if (this.from = i, this.to = t + e.to[this.rangeIndex], this.value = e.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(t) {
    if (t == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = t;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(t) {
    return this.from - t.from || this.startSide - t.startSide || this.rank - t.rank || this.to - t.to || this.endSide - t.endSide;
  }
}
class Ge {
  constructor(t) {
    this.heap = t;
  }
  static from(t, e = null, i = -1) {
    let n = [];
    for (let r = 0; r < t.length; r++)
      for (let o = t[r]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && n.push(new Lo(o, e, i, r));
    return n.length == 1 ? n[0] : new Ge(n);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(t, e = -1e9) {
    for (let i of this.heap)
      i.goto(t, e);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      on(this.heap, i);
    return this.next(), this;
  }
  forward(t, e) {
    for (let i of this.heap)
      i.forward(t, e);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      on(this.heap, i);
    (this.to - t || this.value.endSide - e) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let t = this.heap[0];
      this.from = t.from, this.to = t.to, this.value = t.value, this.rank = t.rank, t.value && t.next(), on(this.heap, 0);
    }
  }
}
function on(s, t) {
  for (let e = s[t]; ; ) {
    let i = (t << 1) + 1;
    if (i >= s.length)
      break;
    let n = s[i];
    if (i + 1 < s.length && n.compare(s[i + 1]) >= 0 && (n = s[i + 1], i++), e.compare(n) < 0)
      break;
    s[i] = e, s[t] = n, t = i;
  }
}
class Ie {
  constructor(t, e, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Ge.from(t, e, i);
  }
  goto(t, e = -1e9) {
    return this.cursor.goto(t, e), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = t, this.endSide = e, this.openStart = -1, this.next(), this;
  }
  forward(t, e) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - t || this.active[this.minActive].endSide - e) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(t, e);
  }
  removeActive(t) {
    hi(this.active, t), hi(this.activeTo, t), hi(this.activeRank, t), this.minActive = js(this.active, this.activeTo);
  }
  addActive(t) {
    let e = 0, { value: i, to: n, rank: r } = this.cursor;
    for (; e < this.activeRank.length && this.activeRank[e] <= r; )
      e++;
    fi(this.active, e, i), fi(this.activeTo, e, n), fi(this.activeRank, e, r), t && fi(t, e, this.cursor.from), this.minActive = js(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let t = this.to, e = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let n = this.minActive;
      if (n > -1 && (this.activeTo[n] - this.cursor.from || this.active[n].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[n] > t) {
          this.to = this.activeTo[n], this.endSide = this.active[n].endSide;
          break;
        }
        this.removeActive(n), i && hi(i, n);
      } else if (this.cursor.value)
        if (this.cursor.from > t) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let r = this.cursor.value;
          if (!r.point)
            this.addActive(i), this.cursor.next();
          else if (e && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = r, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = r.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      this.openStart = 0;
      for (let n = i.length - 1; n >= 0 && i[n] < t; n--)
        this.openStart++;
    }
  }
  activeForPoint(t) {
    if (!this.active.length)
      return this.active;
    let e = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > t || this.activeTo[i] == t && this.active[i].endSide >= this.point.endSide) && e.push(this.active[i]);
    return e.reverse();
  }
  openEnd(t) {
    let e = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > t; i--)
      e++;
    return e;
  }
}
function qs(s, t, e, i, n, r) {
  s.goto(t), e.goto(i);
  let o = i + n, l = i, a = i - t;
  for (; ; ) {
    let h = s.to + a - e.to || s.endSide - e.endSide, f = h < 0 ? s.to + a : e.to, c = Math.min(f, o);
    if (s.point || e.point ? s.point && e.point && (s.point == e.point || s.point.eq(e.point)) && Ln(s.activeForPoint(s.to), e.activeForPoint(e.to)) || r.comparePoint(l, c, s.point, e.point) : c > l && !Ln(s.active, e.active) && r.compareRange(l, c, s.active, e.active), f > o)
      break;
    l = f, h <= 0 && s.next(), h >= 0 && e.next();
  }
}
function Ln(s, t) {
  if (s.length != t.length)
    return !1;
  for (let e = 0; e < s.length; e++)
    if (s[e] != t[e] && !s[e].eq(t[e]))
      return !1;
  return !0;
}
function hi(s, t) {
  for (let e = t, i = s.length - 1; e < i; e++)
    s[e] = s[e + 1];
  s.pop();
}
function fi(s, t, e) {
  for (let i = s.length - 1; i >= t; i--)
    s[i + 1] = s[i];
  s[t] = e;
}
function js(s, t) {
  let e = -1, i = 1e9;
  for (let n = 0; n < t.length; n++)
    (t[n] - i || s[n].endSide - s[e].endSide) < 0 && (e = n, i = t[n]);
  return e;
}
function ms(s, t, e = s.length) {
  let i = 0;
  for (let n = 0; n < e; )
    s.charCodeAt(n) == 9 ? (i += t - i % t, n++) : (i++, n = Vt(s, n));
  return i;
}
function In(s, t, e, i) {
  for (let n = 0, r = 0; ; ) {
    if (r >= t)
      return n;
    if (n == s.length)
      break;
    r += s.charCodeAt(n) == 9 ? e - r % e : 1, n = Vt(s, n);
  }
  return i === !0 ? -1 : s.length;
}
const Nn = "ͼ", Ks = typeof Symbol > "u" ? "__" + Nn : Symbol.for(Nn), Hn = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), $s = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class te {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(t, e) {
    this.rules = [];
    let { finish: i } = e || {};
    function n(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function r(o, l, a, h) {
      let f = [], c = /^@(\w+)\b/.exec(o[0]), u = c && c[1] == "keyframes";
      if (c && l == null) return a.push(o[0] + ";");
      for (let d in l) {
        let p = l[d];
        if (/&/.test(d))
          r(
            d.split(/,\s*/).map((g) => o.map((m) => g.replace(/&/, m))).reduce((g, m) => g.concat(m)),
            p,
            a
          );
        else if (p && typeof p == "object") {
          if (!c) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          r(n(d), p, f, u);
        } else p != null && f.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (g) => "-" + g.toLowerCase()) + ": " + p + ";");
      }
      (f.length || u) && a.push((i && !c && !h ? o.map(i) : o).join(", ") + " {" + f.join(" ") + "}");
    }
    for (let o in t) r(n(o), t[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let t = $s[Ks] || 1;
    return $s[Ks] = t + 1, Nn + t.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(t, e, i) {
    let n = t[Hn], r = i && i.nonce;
    n ? r && n.setNonce(r) : n = new Ia(t, r), n.mount(Array.isArray(e) ? e : [e]);
  }
}
let Us = /* @__PURE__ */ new Map();
class Ia {
  constructor(t, e) {
    let i = t.ownerDocument || t, n = i.defaultView;
    if (!t.head && t.adoptedStyleSheets && n.CSSStyleSheet) {
      let r = Us.get(i);
      if (r)
        return t.adoptedStyleSheets = [r.sheet, ...t.adoptedStyleSheets], t[Hn] = r;
      this.sheet = new n.CSSStyleSheet(), t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets], Us.set(i, this);
    } else {
      this.styleTag = i.createElement("style"), e && this.styleTag.setAttribute("nonce", e);
      let r = t.head || t;
      r.insertBefore(this.styleTag, r.firstChild);
    }
    this.modules = [], t[Hn] = this;
  }
  mount(t) {
    let e = this.sheet, i = 0, n = 0;
    for (let r = 0; r < t.length; r++) {
      let o = t[r], l = this.modules.indexOf(o);
      if (l < n && l > -1 && (this.modules.splice(l, 1), n--, l = -1), l == -1) {
        if (this.modules.splice(n++, 0, o), e) for (let a = 0; a < o.rules.length; a++)
          e.insertRule(o.rules[a], i++);
      } else {
        for (; n < l; ) i += this.modules[n++].rules.length;
        i += o.rules.length, n++;
      }
    }
    if (!e) {
      let r = "";
      for (let o = 0; o < this.modules.length; o++)
        r += this.modules[o].getRules() + `
`;
      this.styleTag.textContent = r;
    }
  }
  setNonce(t) {
    this.styleTag && this.styleTag.getAttribute("nonce") != t && this.styleTag.setAttribute("nonce", t);
  }
}
var ee = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, _e = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Na = typeof navigator < "u" && /Mac/.test(navigator.platform), Ha = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var nt = 0; nt < 10; nt++) ee[48 + nt] = ee[96 + nt] = String(nt);
for (var nt = 1; nt <= 24; nt++) ee[nt + 111] = "F" + nt;
for (var nt = 65; nt <= 90; nt++)
  ee[nt] = String.fromCharCode(nt + 32), _e[nt] = String.fromCharCode(nt);
for (var ln in ee) _e.hasOwnProperty(ln) || (_e[ln] = ee[ln]);
function Fa(s) {
  var t = Na && s.metaKey && s.shiftKey && !s.ctrlKey && !s.altKey || Ha && s.shiftKey && s.key && s.key.length == 1 || s.key == "Unidentified", e = !t && s.key || (s.shiftKey ? _e : ee)[s.keyCode] || s.key || "Unidentified";
  return e == "Esc" && (e = "Escape"), e == "Del" && (e = "Delete"), e == "Left" && (e = "ArrowLeft"), e == "Up" && (e = "ArrowUp"), e == "Right" && (e = "ArrowRight"), e == "Down" && (e = "ArrowDown"), e;
}
function Fi(s) {
  let t;
  return s.nodeType == 11 ? t = s.getSelection ? s : s.ownerDocument : t = s, t.getSelection();
}
function Fn(s, t) {
  return t ? s == t || s.contains(t.nodeType != 1 ? t.parentNode : t) : !1;
}
function Va(s) {
  let t = s.activeElement;
  for (; t && t.shadowRoot; )
    t = t.shadowRoot.activeElement;
  return t;
}
function Ti(s, t) {
  if (!t.anchorNode)
    return !1;
  try {
    return Fn(s, t.anchorNode);
  } catch {
    return !1;
  }
}
function De(s) {
  return s.nodeType == 3 ? ge(s, 0, s.nodeValue.length).getClientRects() : s.nodeType == 1 ? s.getClientRects() : [];
}
function Vi(s, t, e, i) {
  return e ? Gs(s, t, e, i, -1) || Gs(s, t, e, i, 1) : !1;
}
function Wi(s) {
  for (var t = 0; ; t++)
    if (s = s.previousSibling, !s)
      return t;
}
function Gs(s, t, e, i, n) {
  for (; ; ) {
    if (s == e && t == i)
      return !0;
    if (t == (n < 0 ? 0 : ie(s))) {
      if (s.nodeName == "DIV")
        return !1;
      let r = s.parentNode;
      if (!r || r.nodeType != 1)
        return !1;
      t = Wi(s) + (n < 0 ? 0 : 1), s = r;
    } else if (s.nodeType == 1) {
      if (s = s.childNodes[t + (n < 0 ? -1 : 0)], s.nodeType == 1 && s.contentEditable == "false")
        return !1;
      t = n < 0 ? ie(s) : 0;
    } else
      return !1;
  }
}
function ie(s) {
  return s.nodeType == 3 ? s.nodeValue.length : s.childNodes.length;
}
function Zi(s, t) {
  let e = t ? s.left : s.right;
  return { left: e, right: e, top: s.top, bottom: s.bottom };
}
function Wa(s) {
  return {
    left: 0,
    right: s.innerWidth,
    top: 0,
    bottom: s.innerHeight
  };
}
function za(s, t, e, i, n, r, o, l) {
  let a = s.ownerDocument, h = a.defaultView || window;
  for (let f = s, c = !1; f && !c; )
    if (f.nodeType == 1) {
      let u, d = f == a.body;
      if (d)
        u = Wa(h);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(f).position) && (c = !0), f.scrollHeight <= f.clientHeight && f.scrollWidth <= f.clientWidth) {
          f = f.assignedSlot || f.parentNode;
          continue;
        }
        let m = f.getBoundingClientRect();
        u = {
          left: m.left,
          right: m.left + f.clientWidth,
          top: m.top,
          bottom: m.top + f.clientHeight
        };
      }
      let p = 0, g = 0;
      if (n == "nearest")
        t.top < u.top ? (g = -(u.top - t.top + o), e > 0 && t.bottom > u.bottom + g && (g = t.bottom - u.bottom + g + o)) : t.bottom > u.bottom && (g = t.bottom - u.bottom + o, e < 0 && t.top - g < u.top && (g = -(u.top + g - t.top + o)));
      else {
        let m = t.bottom - t.top, y = u.bottom - u.top;
        g = (n == "center" && m <= y ? t.top + m / 2 - y / 2 : n == "start" || n == "center" && e < 0 ? t.top - o : t.bottom - y + o) - u.top;
      }
      if (i == "nearest" ? t.left < u.left ? (p = -(u.left - t.left + r), e > 0 && t.right > u.right + p && (p = t.right - u.right + p + r)) : t.right > u.right && (p = t.right - u.right + r, e < 0 && t.left < u.left + p && (p = -(u.left + p - t.left + r))) : p = (i == "center" ? t.left + (t.right - t.left) / 2 - (u.right - u.left) / 2 : i == "start" == l ? t.left - r : t.right - (u.right - u.left) + r) - u.left, p || g)
        if (d)
          h.scrollBy(p, g);
        else {
          let m = 0, y = 0;
          if (g) {
            let w = f.scrollTop;
            f.scrollTop += g, y = f.scrollTop - w;
          }
          if (p) {
            let w = f.scrollLeft;
            f.scrollLeft += p, m = f.scrollLeft - w;
          }
          t = {
            left: t.left - m,
            top: t.top - y,
            right: t.right - m,
            bottom: t.bottom - y
          }, m && Math.abs(m - p) < 1 && (i = "nearest"), y && Math.abs(y - g) < 1 && (n = "nearest");
        }
      if (d)
        break;
      f = f.assignedSlot || f.parentNode;
    } else if (f.nodeType == 11)
      f = f.host;
    else
      break;
}
function qa(s) {
  let t = s.ownerDocument;
  for (let e = s.parentNode; e && e != t.body; )
    if (e.nodeType == 1) {
      if (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth)
        return e;
      e = e.assignedSlot || e.parentNode;
    } else if (e.nodeType == 11)
      e = e.host;
    else
      break;
  return null;
}
class ja {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(t) {
    return this.anchorNode == t.anchorNode && this.anchorOffset == t.anchorOffset && this.focusNode == t.focusNode && this.focusOffset == t.focusOffset;
  }
  setRange(t) {
    let { anchorNode: e, focusNode: i } = t;
    this.set(e, Math.min(t.anchorOffset, e ? ie(e) : 0), i, Math.min(t.focusOffset, i ? ie(i) : 0));
  }
  set(t, e, i, n) {
    this.anchorNode = t, this.anchorOffset = e, this.focusNode = i, this.focusOffset = n;
  }
}
let we = null;
function Io(s) {
  if (s.setActive)
    return s.setActive();
  if (we)
    return s.focus(we);
  let t = [];
  for (let e = s; e && (t.push(e, e.scrollTop, e.scrollLeft), e != e.ownerDocument); e = e.parentNode)
    ;
  if (s.focus(we == null ? {
    get preventScroll() {
      return we = { preventScroll: !0 }, !0;
    }
  } : void 0), !we) {
    we = !1;
    for (let e = 0; e < t.length; ) {
      let i = t[e++], n = t[e++], r = t[e++];
      i.scrollTop != n && (i.scrollTop = n), i.scrollLeft != r && (i.scrollLeft = r);
    }
  }
}
let _s;
function ge(s, t, e = t) {
  let i = _s || (_s = document.createRange());
  return i.setEnd(s, e), i.setStart(s, t), i;
}
function Me(s, t, e) {
  let i = { key: t, code: t, keyCode: e, which: e, cancelable: !0 }, n = new KeyboardEvent("keydown", i);
  n.synthetic = !0, s.dispatchEvent(n);
  let r = new KeyboardEvent("keyup", i);
  return r.synthetic = !0, s.dispatchEvent(r), n.defaultPrevented || r.defaultPrevented;
}
function Ka(s) {
  for (; s; ) {
    if (s && (s.nodeType == 9 || s.nodeType == 11 && s.host))
      return s;
    s = s.assignedSlot || s.parentNode;
  }
  return null;
}
function No(s) {
  for (; s.attributes.length; )
    s.removeAttributeNode(s.attributes[0]);
}
function $a(s, t) {
  let e = t.focusNode, i = t.focusOffset;
  if (!e || t.anchorNode != e || t.anchorOffset != i)
    return !1;
  for (i = Math.min(i, ie(e)); ; )
    if (i) {
      if (e.nodeType != 1)
        return !1;
      let n = e.childNodes[i - 1];
      n.contentEditable == "false" ? i-- : (e = n, i = ie(e));
    } else {
      if (e == s)
        return !0;
      i = Wi(e), e = e.parentNode;
    }
}
function Ho(s) {
  return s.scrollTop > Math.max(1, s.scrollHeight - s.clientHeight - 4);
}
class ct {
  constructor(t, e, i = !0) {
    this.node = t, this.offset = e, this.precise = i;
  }
  static before(t, e) {
    return new ct(t.parentNode, Wi(t), e);
  }
  static after(t, e) {
    return new ct(t.parentNode, Wi(t) + 1, e);
  }
}
const ys = [];
class $ {
  constructor() {
    this.parent = null, this.dom = null, this.flags = 2;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(t) {
    let e = this.posAtStart;
    for (let i of this.children) {
      if (i == t)
        return e;
      e += i.length + i.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(t) {
    return this.posBefore(t) + t.length;
  }
  sync(t, e) {
    if (this.flags & 2) {
      let i = this.dom, n = null, r;
      for (let o of this.children) {
        if (o.flags & 7) {
          if (!o.dom && (r = n ? n.nextSibling : i.firstChild)) {
            let l = $.get(r);
            (!l || !l.parent && l.canReuseDOM(o)) && o.reuseDOM(r);
          }
          o.sync(t, e), o.flags &= -8;
        }
        if (r = n ? n.nextSibling : i.firstChild, e && !e.written && e.node == i && r != o.dom && (e.written = !0), o.dom.parentNode == i)
          for (; r && r != o.dom; )
            r = Js(r);
        else
          i.insertBefore(o.dom, r);
        n = o.dom;
      }
      for (r = n ? n.nextSibling : i.firstChild, r && e && e.node == i && (e.written = !0); r; )
        r = Js(r);
    } else if (this.flags & 1)
      for (let i of this.children)
        i.flags & 7 && (i.sync(t, e), i.flags &= -8);
  }
  reuseDOM(t) {
  }
  localPosFromDOM(t, e) {
    let i;
    if (t == this.dom)
      i = this.dom.childNodes[e];
    else {
      let n = ie(t) == 0 ? 0 : e == 0 ? -1 : 1;
      for (; ; ) {
        let r = t.parentNode;
        if (r == this.dom)
          break;
        n == 0 && r.firstChild != r.lastChild && (t == r.firstChild ? n = -1 : n = 1), t = r;
      }
      n < 0 ? i = t : i = t.nextSibling;
    }
    if (i == this.dom.firstChild)
      return 0;
    for (; i && !$.get(i); )
      i = i.nextSibling;
    if (!i)
      return this.length;
    for (let n = 0, r = 0; ; n++) {
      let o = this.children[n];
      if (o.dom == i)
        return r;
      r += o.length + o.breakAfter;
    }
  }
  domBoundsAround(t, e, i = 0) {
    let n = -1, r = -1, o = -1, l = -1;
    for (let a = 0, h = i, f = i; a < this.children.length; a++) {
      let c = this.children[a], u = h + c.length;
      if (h < t && u > e)
        return c.domBoundsAround(t, e, h);
      if (u >= t && n == -1 && (n = a, r = h), h > e && c.dom.parentNode == this.dom) {
        o = a, l = f;
        break;
      }
      f = u, h = u + c.breakAfter;
    }
    return {
      from: r,
      to: l < 0 ? i + this.length : l,
      startDOM: (n ? this.children[n - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: o < this.children.length && o >= 0 ? this.children[o].dom : null
    };
  }
  markDirty(t = !1) {
    this.flags |= 2, this.markParentsDirty(t);
  }
  markParentsDirty(t) {
    for (let e = this.parent; e; e = e.parent) {
      if (t && (e.flags |= 2), e.flags & 1)
        return;
      e.flags |= 1, t = !1;
    }
  }
  setParent(t) {
    this.parent != t && (this.parent = t, this.flags & 7 && this.markParentsDirty(!0));
  }
  setDOM(t) {
    this.dom && (this.dom.cmView = null), this.dom = t, t.cmView = this;
  }
  get rootView() {
    for (let t = this; ; ) {
      let e = t.parent;
      if (!e)
        return t;
      t = e;
    }
  }
  replaceChildren(t, e, i = ys) {
    this.markDirty();
    for (let n = t; n < e; n++) {
      let r = this.children[n];
      r.parent == this && r.destroy();
    }
    this.children.splice(t, e - t, ...i);
    for (let n = 0; n < i.length; n++)
      i[n].setParent(this);
  }
  ignoreMutation(t) {
    return !1;
  }
  ignoreEvent(t) {
    return !1;
  }
  childCursor(t = this.length) {
    return new Fo(this.children, t, this.children.length);
  }
  childPos(t, e = 1) {
    return this.childCursor().findPos(t, e);
  }
  toString() {
    let t = this.constructor.name.replace("View", "");
    return t + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (t == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(t) {
    return t.cmView;
  }
  get isEditable() {
    return !0;
  }
  get isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  merge(t, e, i, n, r, o) {
    return !1;
  }
  become(t) {
    return !1;
  }
  canReuseDOM(t) {
    return t.constructor == this.constructor && !((this.flags | t.flags) & 8);
  }
  // When this is a zero-length view with a side, this should return a
  // number <= 0 to indicate it is before its position, or a
  // number > 0 when after its position.
  getSide() {
    return 0;
  }
  destroy() {
    this.parent = null;
  }
}
$.prototype.breakAfter = 0;
function Js(s) {
  let t = s.nextSibling;
  return s.parentNode.removeChild(s), t;
}
class Fo {
  constructor(t, e, i) {
    this.children = t, this.pos = e, this.i = i, this.off = 0;
  }
  findPos(t, e = 1) {
    for (; ; ) {
      if (t > this.pos || t == this.pos && (e > 0 || this.i == 0 || this.children[this.i - 1].breakAfter))
        return this.off = t - this.pos, this;
      let i = this.children[--this.i];
      this.pos -= i.length + i.breakAfter;
    }
  }
}
function Vo(s, t, e, i, n, r, o, l, a) {
  let { children: h } = s, f = h.length ? h[t] : null, c = r.length ? r[r.length - 1] : null, u = c ? c.breakAfter : o;
  if (!(t == i && f && !o && !u && r.length < 2 && f.merge(e, n, r.length ? c : null, e == 0, l, a))) {
    if (i < h.length) {
      let d = h[i];
      d && n < d.length ? (t == i && (d = d.split(n), n = 0), !u && c && d.merge(0, n, c, !0, 0, a) ? r[r.length - 1] = d : (n && d.merge(0, n, null, !1, 0, a), r.push(d))) : d != null && d.breakAfter && (c ? c.breakAfter = 1 : o = 1), i++;
    }
    for (f && (f.breakAfter = o, e > 0 && (!o && r.length && f.merge(e, f.length, r[0], !1, l, 0) ? f.breakAfter = r.shift().breakAfter : (e < f.length || f.children.length && f.children[f.children.length - 1].length == 0) && f.merge(e, f.length, null, !1, l, 0), t++)); t < i && r.length; )
      if (h[i - 1].become(r[r.length - 1]))
        i--, r.pop(), a = r.length ? 0 : l;
      else if (h[t].become(r[0]))
        t++, r.shift(), l = r.length ? 0 : a;
      else
        break;
    !r.length && t && i < h.length && !h[t - 1].breakAfter && h[i].merge(0, 0, h[t - 1], !1, l, a) && t--, (t < i || r.length) && s.replaceChildren(t, i, r);
  }
}
function Wo(s, t, e, i, n, r) {
  let o = s.childCursor(), { i: l, off: a } = o.findPos(e, 1), { i: h, off: f } = o.findPos(t, -1), c = t - e;
  for (let u of i)
    c += u.length;
  s.length += c, Vo(s, h, f, l, a, i, 0, n, r);
}
const xe = "￿";
class zo {
  constructor(t, e) {
    this.points = t, this.text = "", this.lineSeparator = e.facet(F.lineSeparator);
  }
  append(t) {
    this.text += t;
  }
  lineBreak() {
    this.text += xe;
  }
  readRange(t, e) {
    if (!t)
      return this;
    let i = t.parentNode;
    for (let n = t; ; ) {
      this.findPointBefore(i, n);
      let r = this.text.length;
      this.readNode(n);
      let o = n.nextSibling;
      if (o == e)
        break;
      let l = $.get(n), a = $.get(o);
      (l && a ? l.breakAfter : (l ? l.breakAfter : Ys(n)) || Ys(o) && (n.nodeName != "BR" || n.cmIgnore) && this.text.length > r) && this.lineBreak(), n = o;
    }
    return this.findPointBefore(i, e), this;
  }
  readTextNode(t) {
    let e = t.nodeValue;
    for (let i of this.points)
      i.node == t && (i.pos = this.text.length + Math.min(i.offset, e.length));
    for (let i = 0, n = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let r = -1, o = 1, l;
      if (this.lineSeparator ? (r = e.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = n.exec(e)) && (r = l.index, o = l[0].length), this.append(e.slice(i, r < 0 ? e.length : r)), r < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let a of this.points)
          a.node == t && a.pos > this.text.length && (a.pos -= o - 1);
      i = r + o;
    }
  }
  readNode(t) {
    if (t.cmIgnore)
      return;
    let e = $.get(t), i = e && e.overrideDOMText;
    if (i != null) {
      this.findPointInside(t, i.length);
      for (let n = i.iter(); !n.next().done; )
        n.lineBreak ? this.lineBreak() : this.append(n.value);
    } else t.nodeType == 3 ? this.readTextNode(t) : t.nodeName == "BR" ? t.nextSibling && this.lineBreak() : t.nodeType == 1 && this.readRange(t.firstChild, null);
  }
  findPointBefore(t, e) {
    for (let i of this.points)
      i.node == t && t.childNodes[i.offset] == e && (i.pos = this.text.length);
  }
  findPointInside(t, e) {
    for (let i of this.points)
      (t.nodeType == 3 ? i.node == t : t.contains(i.node)) && (i.pos = this.text.length + Math.min(e, i.offset));
  }
}
function Ys(s) {
  return s.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(s.nodeName);
}
class Xs {
  constructor(t, e) {
    this.node = t, this.offset = e, this.pos = -1;
  }
}
let vt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Vn = typeof document < "u" ? document : { documentElement: { style: {} } };
const Wn = /* @__PURE__ */ /Edge\/(\d+)/.exec(vt.userAgent), qo = /* @__PURE__ */ /MSIE \d/.test(vt.userAgent), zn = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(vt.userAgent), tn = !!(qo || zn || Wn), Qs = !tn && /* @__PURE__ */ /gecko\/(\d+)/i.test(vt.userAgent), an = !tn && /* @__PURE__ */ /Chrome\/(\d+)/.exec(vt.userAgent), Ua = "webkitFontSmoothing" in Vn.documentElement.style, jo = !tn && /* @__PURE__ */ /Apple Computer/.test(vt.vendor), Zs = jo && (/* @__PURE__ */ /Mobile\/\w+/.test(vt.userAgent) || vt.maxTouchPoints > 2);
var O = {
  mac: Zs || /* @__PURE__ */ /Mac/.test(vt.platform),
  windows: /* @__PURE__ */ /Win/.test(vt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(vt.platform),
  ie: tn,
  ie_version: qo ? Vn.documentMode || 6 : zn ? +zn[1] : Wn ? +Wn[1] : 0,
  gecko: Qs,
  gecko_version: Qs ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(vt.userAgent) || [0, 0])[1] : 0,
  chrome: !!an,
  chrome_version: an ? +an[1] : 0,
  ios: Zs,
  android: /* @__PURE__ */ /Android\b/.test(vt.userAgent),
  safari: jo,
  webkit_version: Ua ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: Vn.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const Ga = 256;
class zt extends $ {
  constructor(t) {
    super(), this.text = t;
  }
  get length() {
    return this.text.length;
  }
  createDOM(t) {
    this.setDOM(t || document.createTextNode(this.text));
  }
  sync(t, e) {
    this.dom || this.createDOM(), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text);
  }
  reuseDOM(t) {
    t.nodeType == 3 && this.createDOM(t);
  }
  merge(t, e, i) {
    return this.flags & 8 || i && (!(i instanceof zt) || this.length - (e - t) + i.length > Ga || i.flags & 8) ? !1 : (this.text = this.text.slice(0, t) + (i ? i.text : "") + this.text.slice(e), this.markDirty(), !0);
  }
  split(t) {
    let e = new zt(this.text.slice(t));
    return this.text = this.text.slice(0, t), this.markDirty(), e.flags |= this.flags & 8, e;
  }
  localPosFromDOM(t, e) {
    return t == this.dom ? e : e ? this.text.length : 0;
  }
  domAtPos(t) {
    return new ct(this.dom, t);
  }
  domBoundsAround(t, e, i) {
    return { from: i, to: i + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(t, e) {
    return _a(this.dom, t, e);
  }
}
class $t extends $ {
  constructor(t, e = [], i = 0) {
    super(), this.mark = t, this.children = e, this.length = i;
    for (let n of e)
      n.setParent(this);
  }
  setAttrs(t) {
    if (No(t), this.mark.class && (t.className = this.mark.class), this.mark.attrs)
      for (let e in this.mark.attrs)
        t.setAttribute(e, this.mark.attrs[e]);
    return t;
  }
  canReuseDOM(t) {
    return super.canReuseDOM(t) && !((this.flags | t.flags) & 8);
  }
  reuseDOM(t) {
    t.nodeName == this.mark.tagName.toUpperCase() && (this.setDOM(t), this.flags |= 6);
  }
  sync(t, e) {
    this.dom ? this.flags & 4 && this.setAttrs(this.dom) : this.setDOM(this.setAttrs(document.createElement(this.mark.tagName))), super.sync(t, e);
  }
  merge(t, e, i, n, r, o) {
    return i && (!(i instanceof $t && i.mark.eq(this.mark)) || t && r <= 0 || e < this.length && o <= 0) ? !1 : (Wo(this, t, e, i ? i.children : [], r - 1, o - 1), this.markDirty(), !0);
  }
  split(t) {
    let e = [], i = 0, n = -1, r = 0;
    for (let l of this.children) {
      let a = i + l.length;
      a > t && e.push(i < t ? l.split(t - i) : l), n < 0 && i >= t && (n = r), i = a, r++;
    }
    let o = this.length - t;
    return this.length = t, n > -1 && (this.children.length = n, this.markDirty()), new $t(this.mark, e, o);
  }
  domAtPos(t) {
    return Ko(this, t);
  }
  coordsAt(t, e) {
    return Uo(this, t, e);
  }
}
function _a(s, t, e) {
  let i = s.nodeValue.length;
  t > i && (t = i);
  let n = t, r = t, o = 0;
  t == 0 && e < 0 || t == i && e >= 0 ? O.chrome || O.gecko || (t ? (n--, o = 1) : r < i && (r++, o = -1)) : e < 0 ? n-- : r < i && r++;
  let l = ge(s, n, r).getClientRects();
  if (!l.length)
    return null;
  let a = l[(o ? o < 0 : e >= 0) ? 0 : l.length - 1];
  return O.safari && !o && a.width == 0 && (a = Array.prototype.find.call(l, (h) => h.width) || a), o ? Zi(a, o < 0) : a || null;
}
class Xt extends $ {
  static create(t, e, i) {
    return new Xt(t, e, i);
  }
  constructor(t, e, i) {
    super(), this.widget = t, this.length = e, this.side = i, this.prevWidget = null;
  }
  split(t) {
    let e = Xt.create(this.widget, this.length - t, this.side);
    return this.length -= t, e;
  }
  sync(t) {
    (!this.dom || !this.widget.updateDOM(this.dom, t)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(t)), this.dom.contentEditable = "false");
  }
  getSide() {
    return this.side;
  }
  merge(t, e, i, n, r, o) {
    return i && (!(i instanceof Xt) || !this.widget.compare(i.widget) || t > 0 && r <= 0 || e < this.length && o <= 0) ? !1 : (this.length = t + (i ? i.length : 0) + (this.length - e), !0);
  }
  become(t) {
    return t instanceof Xt && t.side == this.side && this.widget.constructor == t.widget.constructor ? (this.widget.compare(t.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = t.widget, this.length = t.length, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(t) {
    return this.widget.ignoreEvent(t);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return V.empty;
    let t = this;
    for (; t.parent; )
      t = t.parent;
    let { view: e } = t, i = e && e.state.doc, n = this.posAtStart;
    return i ? i.slice(n, n + this.length) : V.empty;
  }
  domAtPos(t) {
    return (this.length ? t == 0 : this.side > 0) ? ct.before(this.dom) : ct.after(this.dom, t == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(t, e) {
    let i = this.widget.coordsAt(this.dom, t, e);
    if (i)
      return i;
    let n = this.dom.getClientRects(), r = null;
    if (!n.length)
      return null;
    let o = this.side ? this.side < 0 : t > 0;
    for (let l = o ? n.length - 1 : 0; r = n[l], !(t > 0 ? l == 0 : l == n.length - 1 || r.top < r.bottom); l += o ? -1 : 1)
      ;
    return Zi(r, !o);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class Te extends $ {
  constructor(t) {
    super(), this.side = t;
  }
  get length() {
    return 0;
  }
  merge() {
    return !1;
  }
  become(t) {
    return t instanceof Te && t.side == this.side;
  }
  split() {
    return new Te(this.side);
  }
  sync() {
    if (!this.dom) {
      let t = document.createElement("img");
      t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), this.setDOM(t);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(t) {
    return this.side > 0 ? ct.before(this.dom) : ct.after(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(t) {
    return this.dom.getBoundingClientRect();
  }
  get overrideDOMText() {
    return V.empty;
  }
  get isHidden() {
    return !0;
  }
}
zt.prototype.children = Xt.prototype.children = Te.prototype.children = ys;
function Ko(s, t) {
  let e = s.dom, { children: i } = s, n = 0;
  for (let r = 0; n < i.length; n++) {
    let o = i[n], l = r + o.length;
    if (!(l == r && o.getSide() <= 0)) {
      if (t > r && t < l && o.dom.parentNode == e)
        return o.domAtPos(t - r);
      if (t <= r)
        break;
      r = l;
    }
  }
  for (let r = n; r > 0; r--) {
    let o = i[r - 1];
    if (o.dom.parentNode == e)
      return o.domAtPos(o.length);
  }
  for (let r = n; r < i.length; r++) {
    let o = i[r];
    if (o.dom.parentNode == e)
      return o.domAtPos(0);
  }
  return new ct(e, 0);
}
function $o(s, t, e) {
  let i, { children: n } = s;
  e > 0 && t instanceof $t && n.length && (i = n[n.length - 1]) instanceof $t && i.mark.eq(t.mark) ? $o(i, t.children[0], e - 1) : (n.push(t), t.setParent(s)), s.length += t.length;
}
function Uo(s, t, e) {
  let i = null, n = -1, r = null, o = -1;
  function l(h, f) {
    for (let c = 0, u = 0; c < h.children.length && u <= f; c++) {
      let d = h.children[c], p = u + d.length;
      p >= f && (d.children.length ? l(d, f - u) : (!r || r.isHidden && e > 0) && (p > f || u == p && d.getSide() > 0) ? (r = d, o = f - u) : (u < f || u == p && d.getSide() < 0 && !d.isHidden) && (i = d, n = f - u)), u = p;
    }
  }
  l(s, t);
  let a = (e < 0 ? i : r) || i || r;
  return a ? a.coordsAt(Math.max(0, a == i ? n : o), e) : Ja(s);
}
function Ja(s) {
  let t = s.dom.lastChild;
  if (!t)
    return s.dom.getBoundingClientRect();
  let e = De(t);
  return e[e.length - 1] || null;
}
function qn(s, t) {
  for (let e in s)
    e == "class" && t.class ? t.class += " " + s.class : e == "style" && t.style ? t.style += ";" + s.style : t[e] = s[e];
  return t;
}
const tr = /* @__PURE__ */ Object.create(null);
function bs(s, t, e) {
  if (s == t)
    return !0;
  s || (s = tr), t || (t = tr);
  let i = Object.keys(s), n = Object.keys(t);
  if (i.length - (e && i.indexOf(e) > -1 ? 1 : 0) != n.length - (e && n.indexOf(e) > -1 ? 1 : 0))
    return !1;
  for (let r of i)
    if (r != e && (n.indexOf(r) == -1 || s[r] !== t[r]))
      return !1;
  return !0;
}
function jn(s, t, e) {
  let i = !1;
  if (t)
    for (let n in t)
      e && n in e || (i = !0, n == "style" ? s.style.cssText = "" : s.removeAttribute(n));
  if (e)
    for (let n in e)
      t && t[n] == e[n] || (i = !0, n == "style" ? s.style.cssText = e[n] : s.setAttribute(n, e[n]));
  return i;
}
function Ya(s) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e = 0; e < s.attributes.length; e++) {
    let i = s.attributes[e];
    t[i.name] = i.value;
  }
  return t;
}
class oe {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(t) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(t, e) {
    return !1;
  }
  /**
  @internal
  */
  compare(t) {
    return this == t || this.constructor == t.constructor && this.eq(t);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(t) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(t, e, i) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(t) {
  }
}
var _ = /* @__PURE__ */ function(s) {
  return s[s.Text = 0] = "Text", s[s.WidgetBefore = 1] = "WidgetBefore", s[s.WidgetAfter = 2] = "WidgetAfter", s[s.WidgetRange = 3] = "WidgetRange", s;
}(_ || (_ = {}));
class I extends de {
  constructor(t, e, i, n) {
    super(), this.startSide = t, this.endSide = e, this.widget = i, this.spec = n;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(t) {
    return new ni(t);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(t) {
    let e = Math.max(-1e4, Math.min(1e4, t.side || 0)), i = !!t.block;
    return e += i && !t.inlineOrder ? e > 0 ? 3e8 : -4e8 : e > 0 ? 1e8 : -1e8, new ne(t, e, e, i, t.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(t) {
    let e = !!t.block, i, n;
    if (t.isBlockGap)
      i = -5e8, n = 4e8;
    else {
      let { start: r, end: o } = Go(t, e);
      i = (r ? e ? -3e8 : -1 : 5e8) - 1, n = (o ? e ? 2e8 : 1 : -6e8) + 1;
    }
    return new ne(t, i, n, e, t.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(t) {
    return new si(t);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(t, e = !1) {
    return W.of(t, e);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
I.none = W.empty;
class ni extends I {
  constructor(t) {
    let { start: e, end: i } = Go(t);
    super(e ? -1 : 5e8, i ? 1 : -6e8, null, t), this.tagName = t.tagName || "span", this.class = t.class || "", this.attrs = t.attributes || null;
  }
  eq(t) {
    var e, i;
    return this == t || t instanceof ni && this.tagName == t.tagName && (this.class || ((e = this.attrs) === null || e === void 0 ? void 0 : e.class)) == (t.class || ((i = t.attrs) === null || i === void 0 ? void 0 : i.class)) && bs(this.attrs, t.attrs, "class");
  }
  range(t, e = t) {
    if (t >= e)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(t, e);
  }
}
ni.prototype.point = !1;
class si extends I {
  constructor(t) {
    super(-2e8, -2e8, null, t);
  }
  eq(t) {
    return t instanceof si && this.spec.class == t.spec.class && bs(this.spec.attributes, t.spec.attributes);
  }
  range(t, e = t) {
    if (e != t)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(t, e);
  }
}
si.prototype.mapMode = st.TrackBefore;
si.prototype.point = !0;
class ne extends I {
  constructor(t, e, i, n, r, o) {
    super(e, i, r, t), this.block = n, this.isReplace = o, this.mapMode = n ? e <= 0 ? st.TrackBefore : st.TrackAfter : st.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide < this.endSide ? _.WidgetRange : this.startSide <= 0 ? _.WidgetBefore : _.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(t) {
    return t instanceof ne && Xa(this.widget, t.widget) && this.block == t.block && this.startSide == t.startSide && this.endSide == t.endSide;
  }
  range(t, e = t) {
    if (this.isReplace && (t > e || t == e && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && e != t)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(t, e);
  }
}
ne.prototype.point = !0;
function Go(s, t = !1) {
  let { inclusiveStart: e, inclusiveEnd: i } = s;
  return e == null && (e = s.inclusive), i == null && (i = s.inclusive), { start: e ?? t, end: i ?? t };
}
function Xa(s, t) {
  return s == t || !!(s && t && s.compare(t));
}
function Kn(s, t, e, i = 0) {
  let n = e.length - 1;
  n >= 0 && e[n] + i >= s ? e[n] = Math.max(e[n], t) : e.push(s, t);
}
class ft extends $ {
  constructor() {
    super(...arguments), this.children = [], this.length = 0, this.prevAttrs = void 0, this.attrs = null, this.breakAfter = 0;
  }
  // Consumes source
  merge(t, e, i, n, r, o) {
    if (i) {
      if (!(i instanceof ft))
        return !1;
      this.dom || i.transferDOM(this);
    }
    return n && this.setDeco(i ? i.attrs : null), Wo(this, t, e, i ? i.children : [], r, o), !0;
  }
  split(t) {
    let e = new ft();
    if (e.breakAfter = this.breakAfter, this.length == 0)
      return e;
    let { i, off: n } = this.childPos(t);
    n && (e.append(this.children[i].split(n), 0), this.children[i].merge(n, this.children[i].length, null, !1, 0, 0), i++);
    for (let r = i; r < this.children.length; r++)
      e.append(this.children[r], 0);
    for (; i > 0 && this.children[i - 1].length == 0; )
      this.children[--i].destroy();
    return this.children.length = i, this.markDirty(), this.length = t, e;
  }
  transferDOM(t) {
    this.dom && (this.markDirty(), t.setDOM(this.dom), t.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs, this.prevAttrs = void 0, this.dom = null);
  }
  setDeco(t) {
    bs(this.attrs, t) || (this.dom && (this.prevAttrs = this.attrs, this.markDirty()), this.attrs = t);
  }
  append(t, e) {
    $o(this, t, e);
  }
  // Only called when building a line view in ContentBuilder
  addLineDeco(t) {
    let e = t.spec.attributes, i = t.spec.class;
    e && (this.attrs = qn(e, this.attrs || {})), i && (this.attrs = qn({ class: i }, this.attrs || {}));
  }
  domAtPos(t) {
    return Ko(this, t);
  }
  reuseDOM(t) {
    t.nodeName == "DIV" && (this.setDOM(t), this.flags |= 6);
  }
  sync(t, e) {
    var i;
    this.dom ? this.flags & 4 && (No(this.dom), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0) : (this.setDOM(document.createElement("div")), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0), this.prevAttrs !== void 0 && (jn(this.dom, this.prevAttrs, this.attrs), this.dom.classList.add("cm-line"), this.prevAttrs = void 0), super.sync(t, e);
    let n = this.dom.lastChild;
    for (; n && $.get(n) instanceof $t; )
      n = n.lastChild;
    if (!n || !this.length || n.nodeName != "BR" && ((i = $.get(n)) === null || i === void 0 ? void 0 : i.isEditable) == !1 && (!O.ios || !this.children.some((r) => r instanceof zt))) {
      let r = document.createElement("BR");
      r.cmIgnore = !0, this.dom.appendChild(r);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let t = 0, e;
    for (let i of this.children) {
      if (!(i instanceof zt) || /[^ -~]/.test(i.text))
        return null;
      let n = De(i.dom);
      if (n.length != 1)
        return null;
      t += n[0].width, e = n[0].height;
    }
    return t ? {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: t / this.length,
      textHeight: e
    } : null;
  }
  coordsAt(t, e) {
    let i = Uo(this, t, e);
    if (!this.children.length && i && this.parent) {
      let { heightOracle: n } = this.parent.view.viewState, r = i.bottom - i.top;
      if (Math.abs(r - n.lineHeight) < 2 && n.textHeight < r) {
        let o = (r - n.textHeight) / 2;
        return { top: i.top + o, bottom: i.bottom - o, left: i.left, right: i.left };
      }
    }
    return i;
  }
  become(t) {
    return !1;
  }
  get type() {
    return _.Text;
  }
  static find(t, e) {
    for (let i = 0, n = 0; i < t.children.length; i++) {
      let r = t.children[i], o = n + r.length;
      if (o >= e) {
        if (r instanceof ft)
          return r;
        if (o > e)
          break;
      }
      n = o + r.breakAfter;
    }
    return null;
  }
}
class ue extends $ {
  constructor(t, e, i) {
    super(), this.widget = t, this.length = e, this.type = i, this.breakAfter = 0, this.prevWidget = null;
  }
  merge(t, e, i, n, r, o) {
    return i && (!(i instanceof ue) || !this.widget.compare(i.widget) || t > 0 && r <= 0 || e < this.length && o <= 0) ? !1 : (this.length = t + (i ? i.length : 0) + (this.length - e), !0);
  }
  domAtPos(t) {
    return t == 0 ? ct.before(this.dom) : ct.after(this.dom, t == this.length);
  }
  split(t) {
    let e = this.length - t;
    this.length = t;
    let i = new ue(this.widget, e, this.type);
    return i.breakAfter = this.breakAfter, i;
  }
  get children() {
    return ys;
  }
  sync(t) {
    (!this.dom || !this.widget.updateDOM(this.dom, t)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(t)), this.dom.contentEditable = "false");
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : V.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(t) {
    return t instanceof ue && t.widget.constructor == this.widget.constructor ? (t.widget.compare(this.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = t.widget, this.length = t.length, this.type = t.type, this.breakAfter = t.breakAfter, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(t) {
    return this.widget.ignoreEvent(t);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  coordsAt(t, e) {
    return this.widget.coordsAt(this.dom, t, e);
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class Ke {
  constructor(t, e, i, n) {
    this.doc = t, this.pos = e, this.end = i, this.disallowBlockEffectsFor = n, this.content = [], this.curLine = null, this.breakAtStart = 0, this.pendingBuffer = 0, this.bufferMarks = [], this.atCursorPos = !0, this.openStart = -1, this.openEnd = -1, this.text = "", this.textOff = 0, this.cursor = t.iter(), this.skip = e;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let t = this.content[this.content.length - 1];
    return !t.breakAfter && !(t instanceof ue && t.type == _.WidgetBefore);
  }
  getLine() {
    return this.curLine || (this.content.push(this.curLine = new ft()), this.atCursorPos = !0), this.curLine;
  }
  flushBuffer(t = this.bufferMarks) {
    this.pendingBuffer && (this.curLine.append(ci(new Te(-1), t), t.length), this.pendingBuffer = 0);
  }
  addBlockWidget(t) {
    this.flushBuffer(), this.curLine = null, this.content.push(t);
  }
  finish(t) {
    this.pendingBuffer && t <= this.bufferMarks.length ? this.flushBuffer() : this.pendingBuffer = 0, this.posCovered() || this.getLine();
  }
  buildText(t, e, i) {
    for (; t > 0; ) {
      if (this.textOff == this.text.length) {
        let { value: r, lineBreak: o, done: l } = this.cursor.next(this.skip);
        if (this.skip = 0, l)
          throw new Error("Ran out of text content when drawing inline views");
        if (o) {
          this.posCovered() || this.getLine(), this.content.length ? this.content[this.content.length - 1].breakAfter = 1 : this.breakAtStart = 1, this.flushBuffer(), this.curLine = null, this.atCursorPos = !0, t--;
          continue;
        } else
          this.text = r, this.textOff = 0;
      }
      let n = Math.min(
        this.text.length - this.textOff,
        t,
        512
        /* T.Chunk */
      );
      this.flushBuffer(e.slice(e.length - i)), this.getLine().append(ci(new zt(this.text.slice(this.textOff, this.textOff + n)), e), i), this.atCursorPos = !0, this.textOff += n, t -= n, i = 0;
    }
  }
  span(t, e, i, n) {
    this.buildText(e - t, i, n), this.pos = e, this.openStart < 0 && (this.openStart = n);
  }
  point(t, e, i, n, r, o) {
    if (this.disallowBlockEffectsFor[o] && i instanceof ne) {
      if (i.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (e > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let l = e - t;
    if (i instanceof ne)
      if (i.block) {
        let { type: a } = i;
        a == _.WidgetAfter && !this.posCovered() && this.getLine(), this.addBlockWidget(new ue(i.widget || new er("div"), l, a));
      } else {
        let a = Xt.create(i.widget || new er("span"), l, l ? 0 : i.startSide), h = this.atCursorPos && !a.isEditable && r <= n.length && (t < e || i.startSide > 0), f = !a.isEditable && (t < e || r > n.length || i.startSide <= 0), c = this.getLine();
        this.pendingBuffer == 2 && !h && !a.isEditable && (this.pendingBuffer = 0), this.flushBuffer(n), h && (c.append(ci(new Te(1), n), r), r = n.length + Math.max(0, r - n.length)), c.append(ci(a, n), r), this.atCursorPos = f, this.pendingBuffer = f ? t < e || r > n.length ? 1 : 2 : 0, this.pendingBuffer && (this.bufferMarks = n.slice());
      }
    else this.doc.lineAt(this.pos).from == this.pos && this.getLine().addLineDeco(i);
    l && (this.textOff + l <= this.text.length ? this.textOff += l : (this.skip += l - (this.text.length - this.textOff), this.text = "", this.textOff = 0), this.pos = e), this.openStart < 0 && (this.openStart = r);
  }
  static build(t, e, i, n, r) {
    let o = new Ke(t, e, i, r);
    return o.openEnd = W.spans(n, e, i, o), o.openStart < 0 && (o.openStart = o.openEnd), o.finish(o.openEnd), o;
  }
}
function ci(s, t) {
  for (let e of t)
    s = new $t(e, [s], s.length);
  return s;
}
class er extends oe {
  constructor(t) {
    super(), this.tag = t;
  }
  eq(t) {
    return t.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(t) {
    return t.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
const _o = /* @__PURE__ */ D.define(), Jo = /* @__PURE__ */ D.define(), Yo = /* @__PURE__ */ D.define(), Xo = /* @__PURE__ */ D.define(), $n = /* @__PURE__ */ D.define(), Qo = /* @__PURE__ */ D.define(), Zo = /* @__PURE__ */ D.define(), tl = /* @__PURE__ */ D.define({
  combine: (s) => s.some((t) => t)
}), el = /* @__PURE__ */ D.define({
  combine: (s) => s.some((t) => t)
});
class zi {
  constructor(t, e = "nearest", i = "nearest", n = 5, r = 5) {
    this.range = t, this.y = e, this.x = i, this.yMargin = n, this.xMargin = r;
  }
  map(t) {
    return t.empty ? this : new zi(this.range.map(t), this.y, this.x, this.yMargin, this.xMargin);
  }
}
const ir = /* @__PURE__ */ L.define({ map: (s, t) => s.map(t) });
function Mt(s, t, e) {
  let i = s.facet(Xo);
  i.length ? i[0](t) : window.onerror ? window.onerror(String(t), e, void 0, void 0, t) : e ? console.error(e + ":", t) : console.error(t);
}
const en = /* @__PURE__ */ D.define({ combine: (s) => s.length ? s[0] : !0 });
let Qa = 0;
const Fe = /* @__PURE__ */ D.define();
class tt {
  constructor(t, e, i, n) {
    this.id = t, this.create = e, this.domEventHandlers = i, this.extension = n(this);
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(t, e) {
    const { eventHandlers: i, provide: n, decorations: r } = e || {};
    return new tt(Qa++, t, i, (o) => {
      let l = [Fe.of(o)];
      return r && l.push(Je.of((a) => {
        let h = a.plugin(o);
        return h ? r(h) : I.none;
      })), n && l.push(n(o)), l;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(t, e) {
    return tt.define((i) => new t(i), e);
  }
}
class hn {
  constructor(t) {
    this.spec = t, this.mustUpdate = null, this.value = null;
  }
  update(t) {
    if (this.value) {
      if (this.mustUpdate) {
        let e = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(e);
          } catch (i) {
            if (Mt(e.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.create(t);
      } catch (e) {
        Mt(t.state, e, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(t) {
    var e;
    if (!((e = this.value) === null || e === void 0) && e.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Mt(t.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const il = /* @__PURE__ */ D.define(), ws = /* @__PURE__ */ D.define(), Je = /* @__PURE__ */ D.define(), xs = /* @__PURE__ */ D.define(), nl = /* @__PURE__ */ D.define();
function nr(s, t, e) {
  let i = s.state.facet(nl);
  if (!i.length)
    return i;
  let n = i.map((o) => o instanceof Function ? o(s) : o), r = [];
  return W.spans(n, t, e, {
    point() {
    },
    span(o, l, a, h) {
      let f = r;
      for (let c = a.length - 1; c >= 0; c--, h--) {
        let u = a[c].spec.bidiIsolate, d;
        if (u != null)
          if (h > 0 && f.length && (d = f[f.length - 1]).to == o && d.direction == u)
            d.to = l, f = d.inner;
          else {
            let p = { from: o, to: l, direction: u, inner: [] };
            f.push(p), f = p.inner;
          }
      }
    }
  }), r;
}
const sl = /* @__PURE__ */ D.define();
function rl(s) {
  let t = 0, e = 0, i = 0, n = 0;
  for (let r of s.state.facet(sl)) {
    let o = r(s);
    o && (o.left != null && (t = Math.max(t, o.left)), o.right != null && (e = Math.max(e, o.right)), o.top != null && (i = Math.max(i, o.top)), o.bottom != null && (n = Math.max(n, o.bottom)));
  }
  return { left: t, right: e, top: i, bottom: n };
}
const Ve = /* @__PURE__ */ D.define();
class Ot {
  constructor(t, e, i, n) {
    this.fromA = t, this.toA = e, this.fromB = i, this.toB = n;
  }
  join(t) {
    return new Ot(Math.min(this.fromA, t.fromA), Math.max(this.toA, t.toA), Math.min(this.fromB, t.fromB), Math.max(this.toB, t.toB));
  }
  addToSet(t) {
    let e = t.length, i = this;
    for (; e > 0; e--) {
      let n = t[e - 1];
      if (!(n.fromA > i.toA)) {
        if (n.toA < i.fromA)
          break;
        i = i.join(n), t.splice(e - 1, 1);
      }
    }
    return t.splice(e, 0, i), t;
  }
  static extendWithRanges(t, e) {
    if (e.length == 0)
      return t;
    let i = [];
    for (let n = 0, r = 0, o = 0, l = 0; ; n++) {
      let a = n == t.length ? null : t[n], h = o - l, f = a ? a.fromB : 1e9;
      for (; r < e.length && e[r] < f; ) {
        let c = e[r], u = e[r + 1], d = Math.max(l, c), p = Math.min(f, u);
        if (d <= p && new Ot(d + h, p + h, d, p).addToSet(i), u > f)
          break;
        r += 2;
      }
      if (!a)
        return i;
      new Ot(a.fromA, a.toA, a.fromB, a.toB).addToSet(i), o = a.toA, l = a.toB;
    }
  }
}
class qi {
  constructor(t, e, i) {
    this.view = t, this.state = e, this.transactions = i, this.flags = 0, this.startState = t.state, this.changes = Z.empty(this.startState.doc.length);
    for (let r of i)
      this.changes = this.changes.compose(r.changes);
    let n = [];
    this.changes.iterChangedRanges((r, o, l, a) => n.push(new Ot(r, o, l, a))), this.changedRanges = n;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new qi(t, e, i);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 10) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((t) => t.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
var J = /* @__PURE__ */ function(s) {
  return s[s.LTR = 0] = "LTR", s[s.RTL = 1] = "RTL", s;
}(J || (J = {}));
const Ye = J.LTR, ol = J.RTL;
function ll(s) {
  let t = [];
  for (let e = 0; e < s.length; e++)
    t.push(1 << +s[e]);
  return t;
}
const Za = /* @__PURE__ */ ll("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), th = /* @__PURE__ */ ll("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Un = /* @__PURE__ */ Object.create(null), Rt = [];
for (let s of ["()", "[]", "{}"]) {
  let t = /* @__PURE__ */ s.charCodeAt(0), e = /* @__PURE__ */ s.charCodeAt(1);
  Un[t] = e, Un[e] = -t;
}
function eh(s) {
  return s <= 247 ? Za[s] : 1424 <= s && s <= 1524 ? 2 : 1536 <= s && s <= 1785 ? th[s - 1536] : 1774 <= s && s <= 2220 ? 4 : 8192 <= s && s <= 8203 ? 256 : 64336 <= s && s <= 65023 ? 4 : s == 8204 ? 256 : 1;
}
const ih = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Qt {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ol : Ye;
  }
  /**
  @internal
  */
  constructor(t, e, i) {
    this.from = t, this.to = e, this.level = i;
  }
  /**
  @internal
  */
  side(t, e) {
    return this.dir == e == t ? this.to : this.from;
  }
  /**
  @internal
  */
  static find(t, e, i, n) {
    let r = -1;
    for (let o = 0; o < t.length; o++) {
      let l = t[o];
      if (l.from <= e && l.to >= e) {
        if (l.level == i)
          return o;
        (r < 0 || (n != 0 ? n < 0 ? l.from < e : l.to > e : t[r].level > l.level)) && (r = o);
      }
    }
    if (r < 0)
      throw new RangeError("Index out of range");
    return r;
  }
}
function al(s, t) {
  if (s.length != t.length)
    return !1;
  for (let e = 0; e < s.length; e++) {
    let i = s[e], n = t[e];
    if (i.from != n.from || i.to != n.to || i.direction != n.direction || !al(i.inner, n.inner))
      return !1;
  }
  return !0;
}
const j = [];
function nh(s, t, e, i, n) {
  for (let r = 0; r <= i.length; r++) {
    let o = r ? i[r - 1].to : t, l = r < i.length ? i[r].from : e, a = r ? 256 : n;
    for (let h = o, f = a, c = a; h < l; h++) {
      let u = eh(s.charCodeAt(h));
      u == 512 ? u = f : u == 8 && c == 4 && (u = 16), j[h] = u == 4 ? 2 : u, u & 7 && (c = u), f = u;
    }
    for (let h = o, f = a, c = a; h < l; h++) {
      let u = j[h];
      if (u == 128)
        h < l - 1 && f == j[h + 1] && f & 24 ? u = j[h] = f : j[h] = 256;
      else if (u == 64) {
        let d = h + 1;
        for (; d < l && j[d] == 64; )
          d++;
        let p = h && f == 8 || d < e && j[d] == 8 ? c == 1 ? 1 : 8 : 256;
        for (let g = h; g < d; g++)
          j[g] = p;
        h = d - 1;
      } else u == 8 && c == 1 && (j[h] = 1);
      f = u, u & 7 && (c = u);
    }
  }
}
function sh(s, t, e, i, n) {
  let r = n == 1 ? 2 : 1;
  for (let o = 0, l = 0, a = 0; o <= i.length; o++) {
    let h = o ? i[o - 1].to : t, f = o < i.length ? i[o].from : e;
    for (let c = h, u, d, p; c < f; c++)
      if (d = Un[u = s.charCodeAt(c)])
        if (d < 0) {
          for (let g = l - 3; g >= 0; g -= 3)
            if (Rt[g + 1] == -d) {
              let m = Rt[g + 2], y = m & 2 ? n : m & 4 ? m & 1 ? r : n : 0;
              y && (j[c] = j[Rt[g]] = y), l = g;
              break;
            }
        } else {
          if (Rt.length == 189)
            break;
          Rt[l++] = c, Rt[l++] = u, Rt[l++] = a;
        }
      else if ((p = j[c]) == 2 || p == 1) {
        let g = p == n;
        a = g ? 0 : 1;
        for (let m = l - 3; m >= 0; m -= 3) {
          let y = Rt[m + 2];
          if (y & 2)
            break;
          if (g)
            Rt[m + 2] |= 2;
          else {
            if (y & 4)
              break;
            Rt[m + 2] |= 4;
          }
        }
      }
  }
}
function rh(s, t, e, i) {
  for (let n = 0, r = i; n <= e.length; n++) {
    let o = n ? e[n - 1].to : s, l = n < e.length ? e[n].from : t;
    for (let a = o; a < l; ) {
      let h = j[a];
      if (h == 256) {
        let f = a + 1;
        for (; ; )
          if (f == l) {
            if (n == e.length)
              break;
            f = e[n++].to, l = n < e.length ? e[n].from : t;
          } else if (j[f] == 256)
            f++;
          else
            break;
        let c = r == 1, u = (f < t ? j[f] : i) == 1, d = c == u ? c ? 1 : 2 : i;
        for (let p = f, g = n, m = g ? e[g - 1].to : s; p > a; )
          p == m && (p = e[--g].from, m = g ? e[g - 1].to : s), j[--p] = d;
        a = f;
      } else
        r = h, a++;
    }
  }
}
function Gn(s, t, e, i, n, r, o) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == n % 2)
    for (let a = t, h = 0; a < e; ) {
      let f = !0, c = !1;
      if (h == r.length || a < r[h].from) {
        let g = j[a];
        g != l && (f = !1, c = g == 16);
      }
      let u = !f && l == 1 ? [] : null, d = f ? i : i + 1, p = a;
      t: for (; ; )
        if (h < r.length && p == r[h].from) {
          if (c)
            break t;
          let g = r[h];
          if (!f)
            for (let m = g.to, y = h + 1; ; ) {
              if (m == e)
                break t;
              if (y < r.length && r[y].from == m)
                m = r[y++].to;
              else {
                if (j[m] == l)
                  break t;
                break;
              }
            }
          if (h++, u)
            u.push(g);
          else {
            g.from > a && o.push(new Qt(a, g.from, d));
            let m = g.direction == Ye != !(d % 2);
            _n(s, m ? i + 1 : i, n, g.inner, g.from, g.to, o), a = g.to;
          }
          p = g.to;
        } else {
          if (p == e || (f ? j[p] != l : j[p] == l))
            break;
          p++;
        }
      u ? Gn(s, a, p, i + 1, n, u, o) : a < p && o.push(new Qt(a, p, d)), a = p;
    }
  else
    for (let a = e, h = r.length; a > t; ) {
      let f = !0, c = !1;
      if (!h || a > r[h - 1].to) {
        let g = j[a - 1];
        g != l && (f = !1, c = g == 16);
      }
      let u = !f && l == 1 ? [] : null, d = f ? i : i + 1, p = a;
      t: for (; ; )
        if (h && p == r[h - 1].to) {
          if (c)
            break t;
          let g = r[--h];
          if (!f)
            for (let m = g.from, y = h; ; ) {
              if (m == t)
                break t;
              if (y && r[y - 1].to == m)
                m = r[--y].from;
              else {
                if (j[m - 1] == l)
                  break t;
                break;
              }
            }
          if (u)
            u.push(g);
          else {
            g.to < a && o.push(new Qt(g.to, a, d));
            let m = g.direction == Ye != !(d % 2);
            _n(s, m ? i + 1 : i, n, g.inner, g.from, g.to, o), a = g.from;
          }
          p = g.from;
        } else {
          if (p == t || (f ? j[p - 1] != l : j[p - 1] == l))
            break;
          p--;
        }
      u ? Gn(s, p, a, i + 1, n, u, o) : p < a && o.push(new Qt(p, a, d)), a = p;
    }
}
function _n(s, t, e, i, n, r, o) {
  let l = t % 2 ? 2 : 1;
  nh(s, n, r, i, l), sh(s, n, r, i, l), rh(n, r, i, l), Gn(s, n, r, t, e, i, o);
}
function oh(s, t, e) {
  if (!s)
    return [new Qt(0, 0, t == ol ? 1 : 0)];
  if (t == Ye && !e.length && !ih.test(s))
    return hl(s.length);
  if (e.length)
    for (; s.length > j.length; )
      j[j.length] = 256;
  let i = [], n = t == Ye ? 0 : 1;
  return _n(s, n, n, e, 0, s.length, i), i;
}
function hl(s) {
  return [new Qt(0, s, 0)];
}
let fl = "";
function lh(s, t, e, i, n) {
  var r;
  let o = i.head - s.from, l = -1;
  if (o == 0) {
    if (!n || !s.length)
      return null;
    t[0].level != e && (o = t[0].side(!1, e), l = 0);
  } else if (o == s.length) {
    if (n)
      return null;
    let u = t[t.length - 1];
    u.level != e && (o = u.side(!0, e), l = t.length - 1);
  }
  l < 0 && (l = Qt.find(t, o, (r = i.bidiLevel) !== null && r !== void 0 ? r : -1, i.assoc));
  let a = t[l];
  o == a.side(n, e) && (a = t[l += n ? 1 : -1], o = a.side(!n, e));
  let h = n == (a.dir == e), f = Vt(s.text, o, h);
  if (fl = s.text.slice(Math.min(o, f), Math.max(o, f)), f != a.side(n, e))
    return v.cursor(f + s.from, h ? -1 : 1, a.level);
  let c = l == (n ? t.length - 1 : 0) ? null : t[l + (n ? 1 : -1)];
  return !c && a.level != e ? v.cursor(n ? s.to : s.from, n ? -1 : 1, e) : c && c.level < a.level ? v.cursor(c.side(!n, e) + s.from, n ? 1 : -1, c.level) : v.cursor(f + s.from, n ? -1 : 1, a.level);
}
class sr extends $ {
  get length() {
    return this.view.state.doc.length;
  }
  constructor(t) {
    super(), this.view = t, this.decorations = [], this.dynamicDecorationMap = [], this.hasComposition = null, this.markedForComposition = /* @__PURE__ */ new Set(), this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.setDOM(t.contentDOM), this.children = [new ft()], this.children[0].setParent(this), this.updateDeco(), this.updateInner([new Ot(0, 0, 0, t.state.doc.length)], 0, null);
  }
  // Update the document view to a given state.
  update(t) {
    let e = t.changedRanges;
    this.minWidth > 0 && e.length && (e.every(({ fromA: l, toA: a }) => a < this.minWidthFrom || l > this.minWidthTo) ? (this.minWidthFrom = t.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = t.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0);
    let i = this.view.inputState.composing < 0 ? null : hh(this.view, t.changes);
    if (this.hasComposition) {
      this.markedForComposition.clear();
      let { from: l, to: a } = this.hasComposition;
      e = new Ot(l, a, t.changes.mapPos(l, -1), t.changes.mapPos(a, 1)).addToSet(e.slice());
    }
    this.hasComposition = i ? { from: i.range.fromB, to: i.range.toB } : null, (O.ie || O.chrome) && !i && t && t.state.doc.lines != t.startState.doc.lines && (this.forceSelection = !0);
    let n = this.decorations, r = this.updateDeco(), o = uh(n, r, t.changes);
    return e = Ot.extendWithRanges(e, o), !(this.flags & 7) && e.length == 0 ? !1 : (this.updateInner(e, t.startState.doc.length, i), t.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(t, e, i) {
    this.view.viewState.mustMeasureContent = !0, this.updateChildren(t, e, i);
    let { observer: n } = this.view;
    n.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight + "px", this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = O.chrome || O.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.sync(this.view, o), this.flags &= -8, o && (o.written || n.selectionRange.focusNode != o.node) && (this.forceSelection = !0), this.dom.style.height = "";
    }), this.markedForComposition.forEach(
      (o) => o.flags &= -9
      /* ViewFlag.Composition */
    );
    let r = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.children)
        o instanceof ue && o.widget instanceof rr && r.push(o.dom);
    n.updateGaps(r);
  }
  updateChildren(t, e, i) {
    let n = i ? i.range.addToSet(t.slice()) : t, r = this.childCursor(e);
    for (let o = n.length - 1; ; o--) {
      let l = o >= 0 ? n[o] : null;
      if (!l)
        break;
      let { fromA: a, toA: h, fromB: f, toB: c } = l, u, d, p, g;
      if (i && i.range.fromB < c && i.range.toB > f) {
        let S = Ke.build(this.view.state.doc, f, i.range.fromB, this.decorations, this.dynamicDecorationMap), b = Ke.build(this.view.state.doc, i.range.toB, c, this.decorations, this.dynamicDecorationMap);
        d = S.breakAtStart, p = S.openStart, g = b.openEnd;
        let A = this.compositionView(i);
        b.breakAtStart ? A.breakAfter = 1 : b.content.length && A.merge(A.length, A.length, b.content[0], !1, b.openStart, 0) && (A.breakAfter = b.content[0].breakAfter, b.content.shift()), S.content.length && A.merge(0, 0, S.content[S.content.length - 1], !0, 0, S.openEnd) && S.content.pop(), u = S.content.concat(A).concat(b.content);
      } else
        ({ content: u, breakAtStart: d, openStart: p, openEnd: g } = Ke.build(this.view.state.doc, f, c, this.decorations, this.dynamicDecorationMap));
      let { i: m, off: y } = r.findPos(h, 1), { i: w, off: M } = r.findPos(a, -1);
      Vo(this, w, M, m, y, u, d, p, g);
    }
    i && this.fixCompositionDOM(i);
  }
  compositionView(t) {
    let e = new zt(t.text.nodeValue);
    e.flags |= 8;
    for (let { deco: n } of t.marks)
      e = new $t(n, [e], e.length);
    let i = new ft();
    return i.append(e, 0), i;
  }
  fixCompositionDOM(t) {
    let e = (r, o) => {
      o.flags |= 8, this.markedForComposition.add(o);
      let l = $.get(r);
      l != o && (l && (l.dom = null), o.setDOM(r));
    }, i = this.childPos(t.range.fromB, 1), n = this.children[i.i];
    e(t.line, n);
    for (let r = t.marks.length - 1; r >= -1; r--)
      i = n.childPos(i.off, 1), n = n.children[i.i], e(r >= 0 ? t.marks[r].node : t.text, n);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(t = !1, e = !1) {
    (t || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let i = this.view.root.activeElement, n = i == this.dom, r = !n && Ti(this.dom, this.view.observer.selectionRange) && !(i && this.dom.contains(i));
    if (!(n || e || r))
      return;
    let o = this.forceSelection;
    this.forceSelection = !1;
    let l = this.view.state.selection.main, a = this.domAtPos(l.anchor), h = l.empty ? a : this.domAtPos(l.head);
    if (O.gecko && l.empty && !this.hasComposition && ah(a)) {
      let c = document.createTextNode("");
      this.view.observer.ignore(() => a.node.insertBefore(c, a.node.childNodes[a.offset] || null)), a = h = new ct(c, 0), o = !0;
    }
    let f = this.view.observer.selectionRange;
    (o || !f.focusNode || !Vi(a.node, a.offset, f.anchorNode, f.anchorOffset) || !Vi(h.node, h.offset, f.focusNode, f.focusOffset)) && (this.view.observer.ignore(() => {
      O.android && O.chrome && this.dom.contains(f.focusNode) && dh(f.focusNode, this.dom) && (this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
      let c = Fi(this.view.root);
      if (c) if (l.empty) {
        if (O.gecko) {
          let u = fh(a.node, a.offset);
          if (u && u != 3) {
            let d = ul(a.node, a.offset, u == 1 ? 1 : -1);
            d && (a = new ct(d, u == 1 ? 0 : d.nodeValue.length));
          }
        }
        c.collapse(a.node, a.offset), l.bidiLevel != null && f.caretBidiLevel != null && (f.caretBidiLevel = l.bidiLevel);
      } else if (c.extend) {
        c.collapse(a.node, a.offset);
        try {
          c.extend(h.node, h.offset);
        } catch {
        }
      } else {
        let u = document.createRange();
        l.anchor > l.head && ([a, h] = [h, a]), u.setEnd(h.node, h.offset), u.setStart(a.node, a.offset), c.removeAllRanges(), c.addRange(u);
      }
      r && this.view.root.activeElement == this.dom && (this.dom.blur(), i && i.focus());
    }), this.view.observer.setSelectionRange(a, h)), this.impreciseAnchor = a.precise ? null : new ct(f.anchorNode, f.anchorOffset), this.impreciseHead = h.precise ? null : new ct(f.focusNode, f.focusOffset);
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: t } = this, e = t.state.selection.main, i = Fi(t.root), { anchorNode: n, anchorOffset: r } = t.observer.selectionRange;
    if (!i || !e.empty || !e.assoc || !i.modify)
      return;
    let o = ft.find(this, e.head);
    if (!o)
      return;
    let l = o.posAtStart;
    if (e.head == l || e.head == l + o.length)
      return;
    let a = this.coordsAt(e.head, -1), h = this.coordsAt(e.head, 1);
    if (!a || !h || a.bottom > h.top)
      return;
    let f = this.domAtPos(e.head + e.assoc);
    i.collapse(f.node, f.offset), i.modify("move", e.assoc < 0 ? "forward" : "backward", "lineboundary"), t.observer.readSelectionRange();
    let c = t.observer.selectionRange;
    t.docView.posFromDOM(c.anchorNode, c.anchorOffset) != e.from && i.collapse(n, r);
  }
  nearest(t) {
    for (let e = t; e; ) {
      let i = $.get(e);
      if (i && i.rootView == this)
        return i;
      e = e.parentNode;
    }
    return null;
  }
  posFromDOM(t, e) {
    let i = this.nearest(t);
    if (!i)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return i.localPosFromDOM(t, e) + i.posAtStart;
  }
  domAtPos(t) {
    let { i: e, off: i } = this.childCursor().findPos(t, -1);
    for (; e < this.children.length - 1; ) {
      let n = this.children[e];
      if (i < n.length || n instanceof ft)
        break;
      e++, i = 0;
    }
    return this.children[e].domAtPos(i);
  }
  coordsAt(t, e) {
    for (let i = this.length, n = this.children.length - 1; ; n--) {
      let r = this.children[n], o = i - r.breakAfter - r.length;
      if (t > o || t == o && r.type != _.WidgetBefore && r.type != _.WidgetAfter && (!n || e == 2 || this.children[n - 1].breakAfter || this.children[n - 1].type == _.WidgetBefore && e > -2))
        return r.coordsAt(t - o, e);
      i = o;
    }
  }
  coordsForChar(t) {
    let { i: e, off: i } = this.childPos(t, 1), n = this.children[e];
    if (!(n instanceof ft))
      return null;
    for (; n.children.length; ) {
      let { i: l, off: a } = n.childPos(i, 1);
      for (; ; l++) {
        if (l == n.children.length)
          return null;
        if ((n = n.children[l]).length)
          break;
      }
      i = a;
    }
    if (!(n instanceof zt))
      return null;
    let r = Vt(n.text, i);
    if (r == i)
      return null;
    let o = ge(n.dom, i, r).getClientRects();
    return !o.length || o[0].top >= o[0].bottom ? null : o[0];
  }
  measureVisibleLineHeights(t) {
    let e = [], { from: i, to: n } = t, r = this.view.contentDOM.clientWidth, o = r > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == J.LTR;
    for (let h = 0, f = 0; f < this.children.length; f++) {
      let c = this.children[f], u = h + c.length;
      if (u > n)
        break;
      if (h >= i) {
        let d = c.dom.getBoundingClientRect();
        if (e.push(d.height), o) {
          let p = c.dom.lastChild, g = p ? De(p) : [];
          if (g.length) {
            let m = g[g.length - 1], y = a ? m.right - d.left : d.right - m.left;
            y > l && (l = y, this.minWidth = r, this.minWidthFrom = h, this.minWidthTo = u);
          }
        }
      }
      h = u + c.breakAfter;
    }
    return e;
  }
  textDirectionAt(t) {
    let { i: e } = this.childPos(t, 1);
    return getComputedStyle(this.children[e].dom).direction == "rtl" ? J.RTL : J.LTR;
  }
  measureTextSize() {
    for (let r of this.children)
      if (r instanceof ft) {
        let o = r.measureTextSize();
        if (o)
          return o;
      }
    let t = document.createElement("div"), e, i, n;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.dom.appendChild(t);
      let r = De(t.firstChild)[0];
      e = t.getBoundingClientRect().height, i = r ? r.width / 27 : 7, n = r ? r.height : e, t.remove();
    }), { lineHeight: e, charWidth: i, textHeight: n };
  }
  childCursor(t = this.length) {
    let e = this.children.length;
    return e && (t -= this.children[--e].length), new Fo(this.children, t, e);
  }
  computeBlockGapDeco() {
    let t = [], e = this.view.viewState;
    for (let i = 0, n = 0; ; n++) {
      let r = n == e.viewports.length ? null : e.viewports[n], o = r ? r.from - 1 : this.length;
      if (o > i) {
        let l = e.lineBlockAt(o).bottom - e.lineBlockAt(i).top;
        t.push(I.replace({
          widget: new rr(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!r)
        break;
      i = r.to + 1;
    }
    return I.set(t);
  }
  updateDeco() {
    let t = this.view.state.facet(Je).map((e, i) => (this.dynamicDecorationMap[i] = typeof e == "function") ? e(this.view) : e);
    for (let e = t.length; e < t.length + 3; e++)
      this.dynamicDecorationMap[e] = !1;
    return this.decorations = [
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ];
  }
  scrollIntoView(t) {
    let { range: e } = t, i = this.coordsAt(e.head, e.empty ? e.assoc : e.head > e.anchor ? -1 : 1), n;
    if (!i)
      return;
    !e.empty && (n = this.coordsAt(e.anchor, e.anchor > e.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, n.left),
      top: Math.min(i.top, n.top),
      right: Math.max(i.right, n.right),
      bottom: Math.max(i.bottom, n.bottom)
    });
    let r = rl(this.view), o = {
      left: i.left - r.left,
      top: i.top - r.top,
      right: i.right + r.right,
      bottom: i.bottom + r.bottom
    };
    za(this.view.scrollDOM, o, e.head < e.anchor ? -1 : 1, t.x, t.y, t.xMargin, t.yMargin, this.view.textDirection == J.LTR);
  }
}
function ah(s) {
  return s.node.nodeType == 1 && s.node.firstChild && (s.offset == 0 || s.node.childNodes[s.offset - 1].contentEditable == "false") && (s.offset == s.node.childNodes.length || s.node.childNodes[s.offset].contentEditable == "false");
}
class rr extends oe {
  constructor(t) {
    super(), this.height = t;
  }
  toDOM() {
    let t = document.createElement("div");
    return this.updateDOM(t), t;
  }
  eq(t) {
    return t.height == this.height;
  }
  updateDOM(t) {
    return t.style.height = this.height + "px", !0;
  }
  get estimatedHeight() {
    return this.height;
  }
}
function cl(s) {
  let t = s.observer.selectionRange, e = t.focusNode && ul(t.focusNode, t.focusOffset, 0);
  if (!e)
    return null;
  let i = $.get(e), n, r;
  if (i instanceof zt)
    n = i.posAtStart, r = n + i.length;
  else
    t: for (let o = 0, l = e; ; ) {
      for (let h = l.previousSibling, f; h; h = h.previousSibling) {
        if (f = $.get(h)) {
          n = r = f.posAtEnd + o;
          break t;
        }
        let c = new zo([], s.state);
        if (c.readNode(h), c.text.indexOf(xe) > -1)
          return null;
        o += c.text.length;
      }
      if (l = l.parentNode, !l)
        return null;
      let a = $.get(l);
      if (a) {
        n = r = a.posAtStart + o;
        break;
      }
    }
  return { from: n, to: r, node: e };
}
function hh(s, t) {
  let e = cl(s);
  if (!e)
    return null;
  let { from: i, to: n, node: r } = e, o = t.mapPos(i, -1), l = t.mapPos(n, 1), a = r.nodeValue;
  if (/[\n\r]/.test(a))
    return null;
  if (l - o != a.length) {
    let u = t.mapPos(i, 1), d = t.mapPos(n, -1);
    if (d - u == a.length)
      o = u, l = d;
    else if (s.state.doc.sliceString(l - a.length, l) == a)
      o = l - a.length;
    else if (s.state.doc.sliceString(o, o + a.length) == a)
      l = o + a.length;
    else
      return null;
  }
  let { main: h } = s.state.selection;
  if (s.state.doc.sliceString(o, l) != a || o > h.head || l < h.head)
    return null;
  let f = [], c = new Ot(i, n, o, l);
  for (let u = r.parentNode; ; u = u.parentNode) {
    let d = $.get(u);
    if (d instanceof $t)
      f.push({ node: u, deco: d.mark });
    else {
      if (d instanceof ft || u.nodeName == "DIV" && u.parentNode == s.contentDOM)
        return { range: c, text: r, marks: f, line: u };
      if (u != s.contentDOM)
        f.push({ node: u, deco: new ni({
          inclusive: !0,
          attributes: Ya(u),
          tagName: u.tagName.toLowerCase()
        }) });
      else
        return null;
    }
  }
}
function ul(s, t, e) {
  if (e <= 0)
    for (let i = s, n = t; ; ) {
      if (i.nodeType == 3)
        return i;
      if (i.nodeType == 1 && n > 0)
        i = i.childNodes[n - 1], n = ie(i);
      else
        break;
    }
  if (e >= 0)
    for (let i = s, n = t; ; ) {
      if (i.nodeType == 3)
        return i;
      if (i.nodeType == 1 && n < i.childNodes.length && e >= 0)
        i = i.childNodes[n], n = 0;
      else
        break;
    }
  return null;
}
function fh(s, t) {
  return s.nodeType != 1 ? 0 : (t && s.childNodes[t - 1].contentEditable == "false" ? 1 : 0) | (t < s.childNodes.length && s.childNodes[t].contentEditable == "false" ? 2 : 0);
}
let ch = class {
  constructor() {
    this.changes = [];
  }
  compareRange(t, e) {
    Kn(t, e, this.changes);
  }
  comparePoint(t, e) {
    Kn(t, e, this.changes);
  }
};
function uh(s, t, e) {
  let i = new ch();
  return W.compare(s, t, e, i), i.changes;
}
function dh(s, t) {
  for (let e = s; e && e != t; e = e.assignedSlot || e.parentNode)
    if (e.nodeType == 1 && e.contentEditable == "false")
      return !0;
  return !1;
}
function ph(s, t, e = 1) {
  let i = s.charCategorizer(t), n = s.doc.lineAt(t), r = t - n.from;
  if (n.length == 0)
    return v.cursor(t);
  r == 0 ? e = 1 : r == n.length && (e = -1);
  let o = r, l = r;
  e < 0 ? o = Vt(n.text, r, !1) : l = Vt(n.text, r);
  let a = i(n.text.slice(o, l));
  for (; o > 0; ) {
    let h = Vt(n.text, o, !1);
    if (i(n.text.slice(h, o)) != a)
      break;
    o = h;
  }
  for (; l < n.length; ) {
    let h = Vt(n.text, l);
    if (i(n.text.slice(l, h)) != a)
      break;
    l = h;
  }
  return v.range(o + n.from, l + n.from);
}
function gh(s, t) {
  return t.left > s ? t.left - s : Math.max(0, s - t.right);
}
function mh(s, t) {
  return t.top > s ? t.top - s : Math.max(0, s - t.bottom);
}
function fn(s, t) {
  return s.top < t.bottom - 1 && s.bottom > t.top + 1;
}
function or(s, t) {
  return t < s.top ? { top: t, left: s.left, right: s.right, bottom: s.bottom } : s;
}
function lr(s, t) {
  return t > s.bottom ? { top: s.top, left: s.left, right: s.right, bottom: t } : s;
}
function Jn(s, t, e) {
  let i, n, r, o, l = !1, a, h, f, c;
  for (let p = s.firstChild; p; p = p.nextSibling) {
    let g = De(p);
    for (let m = 0; m < g.length; m++) {
      let y = g[m];
      n && fn(n, y) && (y = or(lr(y, n.bottom), n.top));
      let w = gh(t, y), M = mh(e, y);
      if (w == 0 && M == 0)
        return p.nodeType == 3 ? ar(p, t, e) : Jn(p, t, e);
      if (!i || o > M || o == M && r > w) {
        i = p, n = y, r = w, o = M;
        let S = M ? e < y.top ? -1 : 1 : w ? t < y.left ? -1 : 1 : 0;
        l = !S || (S > 0 ? m < g.length - 1 : m > 0);
      }
      w == 0 ? e > y.bottom && (!f || f.bottom < y.bottom) ? (a = p, f = y) : e < y.top && (!c || c.top > y.top) && (h = p, c = y) : f && fn(f, y) ? f = lr(f, y.bottom) : c && fn(c, y) && (c = or(c, y.top));
    }
  }
  if (f && f.bottom >= e ? (i = a, n = f) : c && c.top <= e && (i = h, n = c), !i)
    return { node: s, offset: 0 };
  let u = Math.max(n.left, Math.min(n.right, t));
  if (i.nodeType == 3)
    return ar(i, u, e);
  if (l && i.contentEditable != "false")
    return Jn(i, u, e);
  let d = Array.prototype.indexOf.call(s.childNodes, i) + (t >= (n.left + n.right) / 2 ? 1 : 0);
  return { node: s, offset: d };
}
function ar(s, t, e) {
  let i = s.nodeValue.length, n = -1, r = 1e9, o = 0;
  for (let l = 0; l < i; l++) {
    let a = ge(s, l, l + 1).getClientRects();
    for (let h = 0; h < a.length; h++) {
      let f = a[h];
      if (f.top == f.bottom)
        continue;
      o || (o = t - f.left);
      let c = (f.top > e ? f.top - e : e - f.bottom) - 1;
      if (f.left - 1 <= t && f.right + 1 >= t && c < r) {
        let u = t >= (f.left + f.right) / 2, d = u;
        if ((O.chrome || O.gecko) && ge(s, l).getBoundingClientRect().left == f.right && (d = !u), c <= 0)
          return { node: s, offset: l + (d ? 1 : 0) };
        n = l + (d ? 1 : 0), r = c;
      }
    }
  }
  return { node: s, offset: n > -1 ? n : o > 0 ? s.nodeValue.length : 0 };
}
function dl(s, t, e, i = -1) {
  var n, r;
  let o = s.contentDOM.getBoundingClientRect(), l = o.top + s.viewState.paddingTop, a, { docHeight: h } = s.viewState, { x: f, y: c } = t, u = c - l;
  if (u < 0)
    return 0;
  if (u > h)
    return s.state.doc.length;
  for (let S = s.viewState.heightOracle.textHeight / 2, b = !1; a = s.elementAtHeight(u), a.type != _.Text; )
    for (; u = i > 0 ? a.bottom + S : a.top - S, !(u >= 0 && u <= h); ) {
      if (b)
        return e ? null : 0;
      b = !0, i = -i;
    }
  c = l + u;
  let d = a.from;
  if (d < s.viewport.from)
    return s.viewport.from == 0 ? 0 : e ? null : hr(s, o, a, f, c);
  if (d > s.viewport.to)
    return s.viewport.to == s.state.doc.length ? s.state.doc.length : e ? null : hr(s, o, a, f, c);
  let p = s.dom.ownerDocument, g = s.root.elementFromPoint ? s.root : p, m = g.elementFromPoint(f, c);
  m && !s.contentDOM.contains(m) && (m = null), m || (f = Math.max(o.left + 1, Math.min(o.right - 1, f)), m = g.elementFromPoint(f, c), m && !s.contentDOM.contains(m) && (m = null));
  let y, w = -1;
  if (m && ((n = s.docView.nearest(m)) === null || n === void 0 ? void 0 : n.isEditable) != !1) {
    if (p.caretPositionFromPoint) {
      let S = p.caretPositionFromPoint(f, c);
      S && ({ offsetNode: y, offset: w } = S);
    } else if (p.caretRangeFromPoint) {
      let S = p.caretRangeFromPoint(f, c);
      S && ({ startContainer: y, startOffset: w } = S, (!s.contentDOM.contains(y) || O.safari && yh(y, w, f) || O.chrome && bh(y, w, f)) && (y = void 0));
    }
  }
  if (!y || !s.docView.dom.contains(y)) {
    let S = ft.find(s.docView, d);
    if (!S)
      return u > a.top + a.height / 2 ? a.to : a.from;
    ({ node: y, offset: w } = Jn(S.dom, f, c));
  }
  let M = s.docView.nearest(y);
  if (!M)
    return null;
  if (M.isWidget && ((r = M.dom) === null || r === void 0 ? void 0 : r.nodeType) == 1) {
    let S = M.dom.getBoundingClientRect();
    return t.y < S.top || t.y <= S.bottom && t.x <= (S.left + S.right) / 2 ? M.posAtStart : M.posAtEnd;
  } else
    return M.localPosFromDOM(y, w) + M.posAtStart;
}
function hr(s, t, e, i, n) {
  let r = Math.round((i - t.left) * s.defaultCharacterWidth);
  if (s.lineWrapping && e.height > s.defaultLineHeight * 1.5) {
    let l = s.viewState.heightOracle.textHeight, a = Math.floor((n - e.top - (s.defaultLineHeight - l) * 0.5) / l);
    r += a * s.viewState.heightOracle.lineLength;
  }
  let o = s.state.sliceDoc(e.from, e.to);
  return e.from + In(o, r, s.state.tabSize);
}
function yh(s, t, e) {
  let i;
  if (s.nodeType != 3 || t != (i = s.nodeValue.length))
    return !1;
  for (let n = s.nextSibling; n; n = n.nextSibling)
    if (n.nodeType != 1 || n.nodeName != "BR")
      return !1;
  return ge(s, i - 1, i).getBoundingClientRect().left > e;
}
function bh(s, t, e) {
  if (t != 0)
    return !1;
  for (let n = s; ; ) {
    let r = n.parentNode;
    if (!r || r.nodeType != 1 || r.firstChild != n)
      return !1;
    if (r.classList.contains("cm-line"))
      break;
    n = r;
  }
  let i = s.nodeType == 1 ? s.getBoundingClientRect() : ge(s, 0, Math.max(s.nodeValue.length, 1)).getBoundingClientRect();
  return e - i.left > 5;
}
function Yn(s, t) {
  let e = s.lineBlockAt(t);
  if (Array.isArray(e.type)) {
    for (let i of e.type)
      if (i.to > t || i.to == t && (i.to == e.to || i.type == _.Text))
        return i;
  }
  return e;
}
function wh(s, t, e, i) {
  let n = Yn(s, t.head), r = !i || n.type != _.Text || !(s.lineWrapping || n.widgetLineBreaks) ? null : s.coordsAtPos(t.assoc < 0 && t.head > n.from ? t.head - 1 : t.head);
  if (r) {
    let o = s.dom.getBoundingClientRect(), l = s.textDirectionAt(n.from), a = s.posAtCoords({
      x: e == (l == J.LTR) ? o.right - 1 : o.left + 1,
      y: (r.top + r.bottom) / 2
    });
    if (a != null)
      return v.cursor(a, e ? -1 : 1);
  }
  return v.cursor(e ? n.to : n.from, e ? -1 : 1);
}
function fr(s, t, e, i) {
  let n = s.state.doc.lineAt(t.head), r = s.bidiSpans(n), o = s.textDirectionAt(n.from);
  for (let l = t, a = null; ; ) {
    let h = lh(n, r, o, l, e), f = fl;
    if (!h) {
      if (n.number == (e ? s.state.doc.lines : 1))
        return l;
      f = `
`, n = s.state.doc.line(n.number + (e ? 1 : -1)), r = s.bidiSpans(n), h = v.cursor(e ? n.from : n.to);
    }
    if (a) {
      if (!a(f))
        return l;
    } else {
      if (!i)
        return h;
      a = i(f);
    }
    l = h;
  }
}
function xh(s, t, e) {
  let i = s.state.charCategorizer(t), n = i(e);
  return (r) => {
    let o = i(r);
    return n == Ct.Space && (n = o), n == o;
  };
}
function vh(s, t, e, i) {
  let n = t.head, r = e ? 1 : -1;
  if (n == (e ? s.state.doc.length : 0))
    return v.cursor(n, t.assoc);
  let o = t.goalColumn, l, a = s.contentDOM.getBoundingClientRect(), h = s.coordsAtPos(n), f = s.documentTop;
  if (h)
    o == null && (o = h.left - a.left), l = r < 0 ? h.top : h.bottom;
  else {
    let d = s.viewState.lineBlockAt(n);
    o == null && (o = Math.min(a.right - a.left, s.defaultCharacterWidth * (n - d.from))), l = (r < 0 ? d.top : d.bottom) + f;
  }
  let c = a.left + o, u = i ?? s.viewState.heightOracle.textHeight >> 1;
  for (let d = 0; ; d += 10) {
    let p = l + (u + d) * r, g = dl(s, { x: c, y: p }, !1, r);
    if (p < a.top || p > a.bottom || (r < 0 ? g < n : g > n))
      return v.cursor(g, t.assoc, void 0, o);
  }
}
function Pi(s, t, e) {
  for (; ; ) {
    let i = 0;
    for (let n of s)
      n.between(t - 1, t + 1, (r, o, l) => {
        if (t > r && t < o) {
          let a = i || e || (t - r < o - t ? -1 : 1);
          t = a < 0 ? r : o, i = a;
        }
      });
    if (!i)
      return t;
  }
}
function cn(s, t, e) {
  let i = Pi(s.state.facet(xs).map((n) => n(s)), e.from, t.head > e.from ? -1 : 1);
  return i == e.from ? e : v.cursor(i, i < e.from ? 1 : -1);
}
class kh {
  setSelectionOrigin(t) {
    this.lastSelectionOrigin = t, this.lastSelectionTime = Date.now();
  }
  constructor(t) {
    this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.chromeScrollHack = -1, this.pendingIOSKey = void 0, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastEscPress = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.registeredEvents = [], this.customHandlers = [], this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.mouseSelection = null;
    let e = (i, n) => {
      this.ignoreDuringComposition(n) || n.type == "keydown" && this.keydown(t, n) || (this.mustFlushObserver(n) && t.observer.forceFlush(), this.runCustomHandlers(n.type, t, n) ? n.preventDefault() : i(t, n));
    };
    for (let i in X) {
      let n = X[i];
      t.contentDOM.addEventListener(i, (r) => {
        cr(t, r) && e(n, r);
      }, Xn[i]), this.registeredEvents.push(i);
    }
    t.scrollDOM.addEventListener("mousedown", (i) => {
      if (i.target == t.scrollDOM && i.clientY > t.contentDOM.getBoundingClientRect().bottom && (e(X.mousedown, i), !i.defaultPrevented && i.button == 2)) {
        let n = t.contentDOM.style.minHeight;
        t.contentDOM.style.minHeight = "100%", setTimeout(() => t.contentDOM.style.minHeight = n, 200);
      }
    }), t.scrollDOM.addEventListener("drop", (i) => {
      i.target == t.scrollDOM && i.clientY > t.contentDOM.getBoundingClientRect().bottom && e(X.drop, i);
    }), O.chrome && O.chrome_version == 102 && t.scrollDOM.addEventListener("wheel", () => {
      this.chromeScrollHack < 0 ? t.contentDOM.style.pointerEvents = "none" : window.clearTimeout(this.chromeScrollHack), this.chromeScrollHack = setTimeout(() => {
        this.chromeScrollHack = -1, t.contentDOM.style.pointerEvents = "";
      }, 100);
    }, { passive: !0 }), this.notifiedFocused = t.hasFocus, O.safari && t.contentDOM.addEventListener("input", () => null);
  }
  ensureHandlers(t, e) {
    var i;
    let n;
    this.customHandlers = [];
    for (let r of e)
      if (n = (i = r.update(t).spec) === null || i === void 0 ? void 0 : i.domEventHandlers) {
        this.customHandlers.push({ plugin: r.value, handlers: n });
        for (let o in n)
          this.registeredEvents.indexOf(o) < 0 && o != "scroll" && (this.registeredEvents.push(o), t.contentDOM.addEventListener(o, (l) => {
            cr(t, l) && this.runCustomHandlers(o, t, l) && l.preventDefault();
          }));
      }
  }
  runCustomHandlers(t, e, i) {
    for (let n of this.customHandlers) {
      let r = n.handlers[t];
      if (r)
        try {
          if (r.call(n.plugin, i, e) || i.defaultPrevented)
            return !0;
        } catch (o) {
          Mt(e.state, o);
        }
    }
    return !1;
  }
  runScrollHandlers(t, e) {
    this.lastScrollTop = t.scrollDOM.scrollTop, this.lastScrollLeft = t.scrollDOM.scrollLeft;
    for (let i of this.customHandlers) {
      let n = i.handlers.scroll;
      if (n)
        try {
          n.call(i.plugin, e, t);
        } catch (r) {
          Mt(t.state, r);
        }
    }
  }
  keydown(t, e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
      return !0;
    if (e.keyCode != 27 && gl.indexOf(e.keyCode) < 0 && (t.inputState.lastEscPress = 0), O.android && O.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return t.observer.delayAndroidKey(e.key, e.keyCode), !0;
    let i;
    return O.ios && !e.synthetic && !e.altKey && !e.metaKey && ((i = pl.find((n) => n.keyCode == e.keyCode)) && !e.ctrlKey || Sh.indexOf(e.key) > -1 && e.ctrlKey && !e.shiftKey) ? (this.pendingIOSKey = i || e, setTimeout(() => this.flushIOSKey(t), 250), !0) : !1;
  }
  flushIOSKey(t) {
    let e = this.pendingIOSKey;
    return e ? (this.pendingIOSKey = void 0, Me(t.contentDOM, e.key, e.keyCode)) : !1;
  }
  ignoreDuringComposition(t) {
    return /^key/.test(t.type) ? this.composing > 0 ? !0 : O.safari && !O.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1 : !1;
  }
  mustFlushObserver(t) {
    return t.type == "keydown" && t.keyCode != 229;
  }
  startMouseSelection(t) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = t;
  }
  update(t) {
    this.mouseSelection && this.mouseSelection.update(t), t.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
const pl = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Sh = "dthko", gl = [16, 17, 18, 20, 91, 92, 224, 225], ui = 6;
function di(s) {
  return Math.max(0, s) * 0.7 + 8;
}
function Ch(s, t) {
  return Math.max(Math.abs(s.clientX - t.clientX), Math.abs(s.clientY - t.clientY));
}
class Ah {
  constructor(t, e, i, n) {
    this.view = t, this.startEvent = e, this.style = i, this.mustSelect = n, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = e, this.scrollParent = qa(t.contentDOM), this.atoms = t.state.facet(xs).map((o) => o(t));
    let r = t.contentDOM.ownerDocument;
    r.addEventListener("mousemove", this.move = this.move.bind(this)), r.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = e.shiftKey, this.multiple = t.state.facet(F.allowMultipleSelections) && Mh(t, e), this.dragging = Dh(t, e) && wl(e) == 1 ? null : !1;
  }
  start(t) {
    this.dragging === !1 && (t.preventDefault(), this.select(t));
  }
  move(t) {
    var e;
    if (t.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && Ch(this.startEvent, t) < 10)
      return;
    this.select(this.lastEvent = t);
    let i = 0, n = 0, r = ((e = this.scrollParent) === null || e === void 0 ? void 0 : e.getBoundingClientRect()) || { left: 0, top: 0, right: this.view.win.innerWidth, bottom: this.view.win.innerHeight }, o = rl(this.view);
    t.clientX - o.left <= r.left + ui ? i = -di(r.left - t.clientX) : t.clientX + o.right >= r.right - ui && (i = di(t.clientX - r.right)), t.clientY - o.top <= r.top + ui ? n = -di(r.top - t.clientY) : t.clientY + o.bottom >= r.bottom - ui && (n = di(t.clientY - r.bottom)), this.setScrollSpeed(i, n);
  }
  up(t) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || t.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let t = this.view.contentDOM.ownerDocument;
    t.removeEventListener("mousemove", this.move), t.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = null;
  }
  setScrollSpeed(t, e) {
    this.scrollSpeed = { x: t, y: e }, t || e ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    this.scrollParent ? (this.scrollParent.scrollLeft += this.scrollSpeed.x, this.scrollParent.scrollTop += this.scrollSpeed.y) : this.view.win.scrollBy(this.scrollSpeed.x, this.scrollSpeed.y), this.dragging === !1 && this.select(this.lastEvent);
  }
  skipAtoms(t) {
    let e = null;
    for (let i = 0; i < t.ranges.length; i++) {
      let n = t.ranges[i], r = null;
      if (n.empty) {
        let o = Pi(this.atoms, n.from, 0);
        o != n.from && (r = v.cursor(o, -1));
      } else {
        let o = Pi(this.atoms, n.from, -1), l = Pi(this.atoms, n.to, 1);
        (o != n.from || l != n.to) && (r = v.range(n.from == n.anchor ? o : l, n.from == n.head ? o : l));
      }
      r && (e || (e = t.ranges.slice()), e[i] = r);
    }
    return e ? v.create(e, t.mainIndex) : t;
  }
  select(t) {
    let { view: e } = this, i = this.skipAtoms(this.style.get(t, this.extend, this.multiple));
    (this.mustSelect || !i.eq(e.state.selection) || i.main.assoc != e.state.selection.main.assoc && this.dragging === !1) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(t) {
    t.docChanged && this.dragging && (this.dragging = this.dragging.map(t.changes)), this.style.update(t) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Mh(s, t) {
  let e = s.state.facet(_o);
  return e.length ? e[0](t) : O.mac ? t.metaKey : t.ctrlKey;
}
function Oh(s, t) {
  let e = s.state.facet(Jo);
  return e.length ? e[0](t) : O.mac ? !t.altKey : !t.ctrlKey;
}
function Dh(s, t) {
  let { main: e } = s.state.selection;
  if (e.empty)
    return !1;
  let i = Fi(s.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let n = i.getRangeAt(0).getClientRects();
  for (let r = 0; r < n.length; r++) {
    let o = n[r];
    if (o.left <= t.clientX && o.right >= t.clientX && o.top <= t.clientY && o.bottom >= t.clientY)
      return !0;
  }
  return !1;
}
function cr(s, t) {
  if (!t.bubbles)
    return !0;
  if (t.defaultPrevented)
    return !1;
  for (let e = t.target, i; e != s.contentDOM; e = e.parentNode)
    if (!e || e.nodeType == 11 || (i = $.get(e)) && i.ignoreEvent(t))
      return !1;
  return !0;
}
const X = /* @__PURE__ */ Object.create(null), Xn = /* @__PURE__ */ Object.create(null), ml = O.ie && O.ie_version < 15 || O.ios && O.webkit_version < 604;
function Th(s) {
  let t = s.dom.parentNode;
  if (!t)
    return;
  let e = t.appendChild(document.createElement("textarea"));
  e.style.cssText = "position: fixed; left: -10000px; top: 10px", e.focus(), setTimeout(() => {
    s.focus(), e.remove(), yl(s, e.value);
  }, 50);
}
function yl(s, t) {
  let { state: e } = s, i, n = 1, r = e.toText(t), o = r.lines == e.selection.ranges.length;
  if (Qn != null && e.selection.ranges.every((a) => a.empty) && Qn == r.toString()) {
    let a = -1;
    i = e.changeByRange((h) => {
      let f = e.doc.lineAt(h.from);
      if (f.from == a)
        return { range: h };
      a = f.from;
      let c = e.toText((o ? r.line(n++).text : t) + e.lineBreak);
      return {
        changes: { from: f.from, insert: c },
        range: v.cursor(h.from + c.length)
      };
    });
  } else o ? i = e.changeByRange((a) => {
    let h = r.line(n++);
    return {
      changes: { from: a.from, to: a.to, insert: h.text },
      range: v.cursor(a.from + h.length)
    };
  }) : i = e.replaceSelection(r);
  s.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
X.keydown = (s, t) => {
  s.inputState.setSelectionOrigin("select"), t.keyCode == 27 && (s.inputState.lastEscPress = Date.now());
};
X.touchstart = (s, t) => {
  s.inputState.lastTouchTime = Date.now(), s.inputState.setSelectionOrigin("select.pointer");
};
X.touchmove = (s) => {
  s.inputState.setSelectionOrigin("select.pointer");
};
Xn.touchstart = Xn.touchmove = { passive: !0 };
X.mousedown = (s, t) => {
  if (s.observer.flush(), s.inputState.lastTouchTime > Date.now() - 2e3)
    return;
  let e = null;
  for (let i of s.state.facet(Yo))
    if (e = i(s, t), e)
      break;
  if (!e && t.button == 0 && (e = Rh(s, t)), e) {
    let i = !s.hasFocus;
    s.inputState.startMouseSelection(new Ah(s, t, e, i)), i && s.observer.ignore(() => Io(s.contentDOM)), s.inputState.mouseSelection && s.inputState.mouseSelection.start(t);
  }
};
function ur(s, t, e, i) {
  if (i == 1)
    return v.cursor(t, e);
  if (i == 2)
    return ph(s.state, t, e);
  {
    let n = ft.find(s.docView, t), r = s.state.doc.lineAt(n ? n.posAtEnd : t), o = n ? n.posAtStart : r.from, l = n ? n.posAtEnd : r.to;
    return l < s.state.doc.length && l == r.to && l++, v.range(o, l);
  }
}
let bl = (s, t) => s >= t.top && s <= t.bottom, dr = (s, t, e) => bl(t, e) && s >= e.left && s <= e.right;
function Ph(s, t, e, i) {
  let n = ft.find(s.docView, t);
  if (!n)
    return 1;
  let r = t - n.posAtStart;
  if (r == 0)
    return 1;
  if (r == n.length)
    return -1;
  let o = n.coordsAt(r, -1);
  if (o && dr(e, i, o))
    return -1;
  let l = n.coordsAt(r, 1);
  return l && dr(e, i, l) ? 1 : o && bl(i, o) ? -1 : 1;
}
function pr(s, t) {
  let e = s.posAtCoords({ x: t.clientX, y: t.clientY }, !1);
  return { pos: e, bias: Ph(s, e, t.clientX, t.clientY) };
}
const Bh = O.ie && O.ie_version <= 11;
let gr = null, mr = 0, yr = 0;
function wl(s) {
  if (!Bh)
    return s.detail;
  let t = gr, e = yr;
  return gr = s, yr = Date.now(), mr = !t || e > Date.now() - 400 && Math.abs(t.clientX - s.clientX) < 2 && Math.abs(t.clientY - s.clientY) < 2 ? (mr + 1) % 3 : 1;
}
function Rh(s, t) {
  let e = pr(s, t), i = wl(t), n = s.state.selection;
  return {
    update(r) {
      r.docChanged && (e.pos = r.changes.mapPos(e.pos), n = n.map(r.changes));
    },
    get(r, o, l) {
      let a = pr(s, r), h, f = ur(s, a.pos, a.bias, i);
      if (e.pos != a.pos && !o) {
        let c = ur(s, e.pos, e.bias, i), u = Math.min(c.from, f.from), d = Math.max(c.to, f.to);
        f = u < f.from ? v.range(u, d) : v.range(d, u);
      }
      return o ? n.replaceRange(n.main.extend(f.from, f.to)) : l && i == 1 && n.ranges.length > 1 && (h = Eh(n, a.pos)) ? h : l ? n.addRange(f) : v.create([f]);
    }
  };
}
function Eh(s, t) {
  for (let e = 0; e < s.ranges.length; e++) {
    let { from: i, to: n } = s.ranges[e];
    if (i <= t && n >= t)
      return v.create(s.ranges.slice(0, e).concat(s.ranges.slice(e + 1)), s.mainIndex == e ? 0 : s.mainIndex - (s.mainIndex > e ? 1 : 0));
  }
  return null;
}
X.dragstart = (s, t) => {
  let { selection: { main: e } } = s.state, { mouseSelection: i } = s.inputState;
  i && (i.dragging = e), t.dataTransfer && (t.dataTransfer.setData("Text", s.state.sliceDoc(e.from, e.to)), t.dataTransfer.effectAllowed = "copyMove");
};
function br(s, t, e, i) {
  if (!e)
    return;
  let n = s.posAtCoords({ x: t.clientX, y: t.clientY }, !1);
  t.preventDefault();
  let { mouseSelection: r } = s.inputState, o = i && r && r.dragging && Oh(s, t) ? { from: r.dragging.from, to: r.dragging.to } : null, l = { from: n, insert: e }, a = s.state.changes(o ? [o, l] : l);
  s.focus(), s.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(n, -1), head: a.mapPos(n, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  });
}
X.drop = (s, t) => {
  if (!t.dataTransfer)
    return;
  if (s.state.readOnly)
    return t.preventDefault();
  let e = t.dataTransfer.files;
  if (e && e.length) {
    t.preventDefault();
    let i = Array(e.length), n = 0, r = () => {
      ++n == e.length && br(s, t, i.filter((o) => o != null).join(s.state.lineBreak), !1);
    };
    for (let o = 0; o < e.length; o++) {
      let l = new FileReader();
      l.onerror = r, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), r();
      }, l.readAsText(e[o]);
    }
  } else
    br(s, t, t.dataTransfer.getData("Text"), !0);
};
X.paste = (s, t) => {
  if (s.state.readOnly)
    return t.preventDefault();
  s.observer.flush();
  let e = ml ? null : t.clipboardData;
  e ? (yl(s, e.getData("text/plain") || e.getData("text/uri-text")), t.preventDefault()) : Th(s);
};
function Lh(s, t) {
  let e = s.dom.parentNode;
  if (!e)
    return;
  let i = e.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = t, i.focus(), i.selectionEnd = t.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), s.focus();
  }, 50);
}
function Ih(s) {
  let t = [], e = [], i = !1;
  for (let n of s.selection.ranges)
    n.empty || (t.push(s.sliceDoc(n.from, n.to)), e.push(n));
  if (!t.length) {
    let n = -1;
    for (let { from: r } of s.selection.ranges) {
      let o = s.doc.lineAt(r);
      o.number > n && (t.push(o.text), e.push({ from: o.from, to: Math.min(s.doc.length, o.to + 1) })), n = o.number;
    }
    i = !0;
  }
  return { text: t.join(s.lineBreak), ranges: e, linewise: i };
}
let Qn = null;
X.copy = X.cut = (s, t) => {
  let { text: e, ranges: i, linewise: n } = Ih(s.state);
  if (!e && !n)
    return;
  Qn = n ? e : null;
  let r = ml ? null : t.clipboardData;
  r ? (t.preventDefault(), r.clearData(), r.setData("text/plain", e)) : Lh(s, e), t.type == "cut" && !s.state.readOnly && s.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
};
const xl = /* @__PURE__ */ ye.define();
function vl(s, t) {
  let e = [];
  for (let i of s.facet(Zo)) {
    let n = i(s, t);
    n && e.push(n);
  }
  return e ? s.update({ effects: e, annotations: xl.of(!0) }) : null;
}
function kl(s) {
  setTimeout(() => {
    let t = s.hasFocus;
    if (t != s.inputState.notifiedFocused) {
      let e = vl(s.state, t);
      e ? s.dispatch(e) : s.update([]);
    }
  }, 10);
}
X.focus = (s) => {
  s.inputState.lastFocusTime = Date.now(), !s.scrollDOM.scrollTop && (s.inputState.lastScrollTop || s.inputState.lastScrollLeft) && (s.scrollDOM.scrollTop = s.inputState.lastScrollTop, s.scrollDOM.scrollLeft = s.inputState.lastScrollLeft), kl(s);
};
X.blur = (s) => {
  s.observer.clearSelectionRange(), kl(s);
};
X.compositionstart = X.compositionupdate = (s) => {
  s.inputState.compositionFirstChange == null && (s.inputState.compositionFirstChange = !0), s.inputState.composing < 0 && (s.inputState.composing = 0);
};
X.compositionend = (s) => {
  s.inputState.composing = -1, s.inputState.compositionEndedAt = Date.now(), s.inputState.compositionPendingKey = !0, s.inputState.compositionPendingChange = s.observer.pendingRecords().length > 0, s.inputState.compositionFirstChange = null, O.chrome && O.android ? s.observer.flushSoon() : s.inputState.compositionPendingChange ? Promise.resolve().then(() => s.observer.flush()) : setTimeout(() => {
    s.inputState.composing < 0 && s.docView.hasComposition && s.update([]);
  }, 50);
};
X.contextmenu = (s) => {
  s.inputState.lastContextMenu = Date.now();
};
X.beforeinput = (s, t) => {
  var e;
  let i;
  if (O.chrome && O.android && (i = pl.find((n) => n.inputType == t.inputType)) && (s.observer.delayAndroidKey(i.key, i.keyCode), i.key == "Backspace" || i.key == "Delete")) {
    let n = ((e = window.visualViewport) === null || e === void 0 ? void 0 : e.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > n + 10 && s.hasFocus && (s.contentDOM.blur(), s.focus());
    }, 100);
  }
};
const wr = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class Nh {
  constructor(t) {
    this.lineWrapping = t, this.doc = V.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30, this.heightChanged = !1;
  }
  heightForGap(t, e) {
    let i = this.doc.lineAt(e).number - this.doc.lineAt(t).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((e - t - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(t) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((t - this.lineLength) / (this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(t) {
    return this.doc = t, this;
  }
  mustRefreshForWrapping(t) {
    return wr.indexOf(t) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(t) {
    let e = !1;
    for (let i = 0; i < t.length; i++) {
      let n = t[i];
      n < 0 ? i++ : this.heightSamples[Math.floor(n * 10)] || (e = !0, this.heightSamples[Math.floor(n * 10)] = !0);
    }
    return e;
  }
  refresh(t, e, i, n, r, o) {
    let l = wr.indexOf(t) > -1, a = Math.round(e) != Math.round(this.lineHeight) || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = e, this.charWidth = i, this.textHeight = n, this.lineLength = r, a) {
      this.heightSamples = {};
      for (let h = 0; h < o.length; h++) {
        let f = o[h];
        f < 0 ? h++ : this.heightSamples[Math.floor(f * 10)] = !0;
      }
    }
    return a;
  }
}
class Hh {
  constructor(t, e) {
    this.from = t, this.heights = e, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Ft {
  /**
  @internal
  */
  constructor(t, e, i, n, r) {
    this.from = t, this.length = e, this.top = i, this.height = n, this._content = r;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? _.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof ne ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(t) {
    let e = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(t._content) ? t._content : [t]);
    return new Ft(this.from, this.length + t.length, this.top, this.height + t.height, e);
  }
}
var U = /* @__PURE__ */ function(s) {
  return s[s.ByPos = 0] = "ByPos", s[s.ByHeight = 1] = "ByHeight", s[s.ByPosNoHeight = 2] = "ByPosNoHeight", s;
}(U || (U = {}));
const Bi = 1e-3;
class ut {
  constructor(t, e, i = 2) {
    this.length = t, this.height = e, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(t) {
    this.flags = (t ? 2 : 0) | this.flags & -3;
  }
  setHeight(t, e) {
    this.height != e && (Math.abs(this.height - e) > Bi && (t.heightChanged = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(t, e, i) {
    return ut.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(t, e) {
    e.push(this);
  }
  decomposeRight(t, e) {
    e.push(this);
  }
  applyChanges(t, e, i, n) {
    let r = this, o = i.doc;
    for (let l = n.length - 1; l >= 0; l--) {
      let { fromA: a, toA: h, fromB: f, toB: c } = n[l], u = r.lineAt(a, U.ByPosNoHeight, i.setDoc(e), 0, 0), d = u.to >= h ? u : r.lineAt(h, U.ByPosNoHeight, i, 0, 0);
      for (c += d.to - h, h = d.to; l > 0 && u.from <= n[l - 1].toA; )
        a = n[l - 1].fromA, f = n[l - 1].fromB, l--, a < u.from && (u = r.lineAt(a, U.ByPosNoHeight, i, 0, 0));
      f += u.from - a, a = u.from;
      let p = vs.build(i.setDoc(o), t, f, c);
      r = r.replace(a, h, p);
    }
    return r.updateHeight(i, 0);
  }
  static empty() {
    return new wt(0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(t) {
    if (t.length == 1)
      return t[0];
    let e = 0, i = t.length, n = 0, r = 0;
    for (; ; )
      if (e == i)
        if (n > r * 2) {
          let l = t[e - 1];
          l.break ? t.splice(--e, 1, l.left, null, l.right) : t.splice(--e, 1, l.left, l.right), i += 1 + l.break, n -= l.size;
        } else if (r > n * 2) {
          let l = t[i];
          l.break ? t.splice(i, 1, l.left, null, l.right) : t.splice(i, 1, l.left, l.right), i += 2 + l.break, r -= l.size;
        } else
          break;
      else if (n < r) {
        let l = t[e++];
        l && (n += l.size);
      } else {
        let l = t[--i];
        l && (r += l.size);
      }
    let o = 0;
    return t[e - 1] == null ? (o = 1, e--) : t[e] == null && (o = 1, i++), new Fh(ut.of(t.slice(0, e)), o, ut.of(t.slice(i)));
  }
}
ut.prototype.size = 1;
class Sl extends ut {
  constructor(t, e, i) {
    super(t, e), this.deco = i;
  }
  blockAt(t, e, i, n) {
    return new Ft(n, this.length, i, this.height, this.deco || 0);
  }
  lineAt(t, e, i, n, r) {
    return this.blockAt(0, i, n, r);
  }
  forEachLine(t, e, i, n, r, o) {
    t <= r + this.length && e >= r && o(this.blockAt(0, i, n, r));
  }
  updateHeight(t, e = 0, i = !1, n) {
    return n && n.from <= e && n.more && this.setHeight(t, n.heights[n.index++]), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class wt extends Sl {
  constructor(t, e) {
    super(t, e, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0;
  }
  blockAt(t, e, i, n) {
    return new Ft(n, this.length, i, this.height, this.breaks);
  }
  replace(t, e, i) {
    let n = i[0];
    return i.length == 1 && (n instanceof wt || n instanceof it && n.flags & 4) && Math.abs(this.length - n.length) < 10 ? (n instanceof it ? n = new wt(n.length, this.height) : n.height = this.height, this.outdated || (n.outdated = !1), n) : ut.of(i);
  }
  updateHeight(t, e = 0, i = !1, n) {
    return n && n.from <= e && n.more ? this.setHeight(t, n.heights[n.index++]) : (i || this.outdated) && this.setHeight(t, Math.max(this.widgetHeight, t.heightForLine(this.length - this.collapsed)) + this.breaks * t.lineHeight), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class it extends ut {
  constructor(t) {
    super(t, 0);
  }
  heightMetrics(t, e) {
    let i = t.doc.lineAt(e).number, n = t.doc.lineAt(e + this.length).number, r = n - i + 1, o, l = 0;
    if (t.lineWrapping) {
      let a = Math.min(this.height, t.lineHeight * r);
      o = a / r, this.length > r + 1 && (l = (this.height - a) / (this.length - r - 1));
    } else
      o = this.height / r;
    return { firstLine: i, lastLine: n, perLine: o, perChar: l };
  }
  blockAt(t, e, i, n) {
    let { firstLine: r, lastLine: o, perLine: l, perChar: a } = this.heightMetrics(e, n);
    if (e.lineWrapping) {
      let h = n + Math.round(Math.max(0, Math.min(1, (t - i) / this.height)) * this.length), f = e.doc.lineAt(h), c = l + f.length * a, u = Math.max(i, t - c / 2);
      return new Ft(f.from, f.length, u, c, 0);
    } else {
      let h = Math.max(0, Math.min(o - r, Math.floor((t - i) / l))), { from: f, length: c } = e.doc.line(r + h);
      return new Ft(f, c, i + l * h, l, 0);
    }
  }
  lineAt(t, e, i, n, r) {
    if (e == U.ByHeight)
      return this.blockAt(t, i, n, r);
    if (e == U.ByPosNoHeight) {
      let { from: d, to: p } = i.doc.lineAt(t);
      return new Ft(d, p - d, 0, 0, 0);
    }
    let { firstLine: o, perLine: l, perChar: a } = this.heightMetrics(i, r), h = i.doc.lineAt(t), f = l + h.length * a, c = h.number - o, u = n + l * c + a * (h.from - r - c);
    return new Ft(h.from, h.length, Math.max(n, Math.min(u, n + this.height - f)), f, 0);
  }
  forEachLine(t, e, i, n, r, o) {
    t = Math.max(t, r), e = Math.min(e, r + this.length);
    let { firstLine: l, perLine: a, perChar: h } = this.heightMetrics(i, r);
    for (let f = t, c = n; f <= e; ) {
      let u = i.doc.lineAt(f);
      if (f == t) {
        let p = u.number - l;
        c += a * p + h * (t - r - p);
      }
      let d = a + h * u.length;
      o(new Ft(u.from, u.length, c, d, 0)), c += d, f = u.to + 1;
    }
  }
  replace(t, e, i) {
    let n = this.length - e;
    if (n > 0) {
      let r = i[i.length - 1];
      r instanceof it ? i[i.length - 1] = new it(r.length + n) : i.push(null, new it(n - 1));
    }
    if (t > 0) {
      let r = i[0];
      r instanceof it ? i[0] = new it(t + r.length) : i.unshift(new it(t - 1), null);
    }
    return ut.of(i);
  }
  decomposeLeft(t, e) {
    e.push(new it(t - 1), null);
  }
  decomposeRight(t, e) {
    e.push(null, new it(this.length - t - 1));
  }
  updateHeight(t, e = 0, i = !1, n) {
    let r = e + this.length;
    if (n && n.from <= e + this.length && n.more) {
      let o = [], l = Math.max(e, n.from), a = -1;
      for (n.from > e && o.push(new it(n.from - e - 1).updateHeight(t, e)); l <= r && n.more; ) {
        let f = t.doc.lineAt(l).length;
        o.length && o.push(null);
        let c = n.heights[n.index++];
        a == -1 ? a = c : Math.abs(c - a) >= Bi && (a = -2);
        let u = new wt(f, c);
        u.outdated = !1, o.push(u), l += f + 1;
      }
      l <= r && o.push(null, new it(r - l).updateHeight(t, l));
      let h = ut.of(o);
      return (a < 0 || Math.abs(h.height - this.height) >= Bi || Math.abs(a - this.heightMetrics(t, e).perLine) >= Bi) && (t.heightChanged = !0), h;
    } else (i || this.outdated) && (this.setHeight(t, t.heightForGap(e, e + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Fh extends ut {
  constructor(t, e, i) {
    super(t.length + e + i.length, t.height + i.height, e | (t.outdated || i.outdated ? 2 : 0)), this.left = t, this.right = i, this.size = t.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(t, e, i, n) {
    let r = i + this.left.height;
    return t < r ? this.left.blockAt(t, e, i, n) : this.right.blockAt(t, e, r, n + this.left.length + this.break);
  }
  lineAt(t, e, i, n, r) {
    let o = n + this.left.height, l = r + this.left.length + this.break, a = e == U.ByHeight ? t < o : t < l, h = a ? this.left.lineAt(t, e, i, n, r) : this.right.lineAt(t, e, i, o, l);
    if (this.break || (a ? h.to < l : h.from > l))
      return h;
    let f = e == U.ByPosNoHeight ? U.ByPosNoHeight : U.ByPos;
    return a ? h.join(this.right.lineAt(l, f, i, o, l)) : this.left.lineAt(l, f, i, n, r).join(h);
  }
  forEachLine(t, e, i, n, r, o) {
    let l = n + this.left.height, a = r + this.left.length + this.break;
    if (this.break)
      t < a && this.left.forEachLine(t, e, i, n, r, o), e >= a && this.right.forEachLine(t, e, i, l, a, o);
    else {
      let h = this.lineAt(a, U.ByPos, i, n, r);
      t < h.from && this.left.forEachLine(t, h.from - 1, i, n, r, o), h.to >= t && h.from <= e && o(h), e > h.to && this.right.forEachLine(h.to + 1, e, i, l, a, o);
    }
  }
  replace(t, e, i) {
    let n = this.left.length + this.break;
    if (e < n)
      return this.balanced(this.left.replace(t, e, i), this.right);
    if (t > this.left.length)
      return this.balanced(this.left, this.right.replace(t - n, e - n, i));
    let r = [];
    t > 0 && this.decomposeLeft(t, r);
    let o = r.length;
    for (let l of i)
      r.push(l);
    if (t > 0 && xr(r, o - 1), e < this.length) {
      let l = r.length;
      this.decomposeRight(e, r), xr(r, l);
    }
    return ut.of(r);
  }
  decomposeLeft(t, e) {
    let i = this.left.length;
    if (t <= i)
      return this.left.decomposeLeft(t, e);
    e.push(this.left), this.break && (i++, t >= i && e.push(null)), t > i && this.right.decomposeLeft(t - i, e);
  }
  decomposeRight(t, e) {
    let i = this.left.length, n = i + this.break;
    if (t >= n)
      return this.right.decomposeRight(t - n, e);
    t < i && this.left.decomposeRight(t, e), this.break && t < n && e.push(null), e.push(this.right);
  }
  balanced(t, e) {
    return t.size > 2 * e.size || e.size > 2 * t.size ? ut.of(this.break ? [t, null, e] : [t, e]) : (this.left = t, this.right = e, this.height = t.height + e.height, this.outdated = t.outdated || e.outdated, this.size = t.size + e.size, this.length = t.length + this.break + e.length, this);
  }
  updateHeight(t, e = 0, i = !1, n) {
    let { left: r, right: o } = this, l = e + r.length + this.break, a = null;
    return n && n.from <= e + r.length && n.more ? a = r = r.updateHeight(t, e, i, n) : r.updateHeight(t, e, i), n && n.from <= l + o.length && n.more ? a = o = o.updateHeight(t, l, i, n) : o.updateHeight(t, l, i), a ? this.balanced(r, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function xr(s, t) {
  let e, i;
  s[t] == null && (e = s[t - 1]) instanceof it && (i = s[t + 1]) instanceof it && s.splice(t - 1, 3, new it(e.length + 1 + i.length));
}
const Vh = 5;
class vs {
  constructor(t, e) {
    this.pos = t, this.oracle = e, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = t;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(t, e) {
    if (this.lineStart > -1) {
      let i = Math.min(e, this.lineEnd), n = this.nodes[this.nodes.length - 1];
      n instanceof wt ? n.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new wt(i - this.pos, -1)), this.writtenTo = i, e > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = e;
  }
  point(t, e, i) {
    if (t < e || i.heightRelevant) {
      let n = i.widget ? i.widget.estimatedHeight : 0, r = i.widget ? i.widget.lineBreaks : 0;
      n < 0 && (n = this.oracle.lineHeight);
      let o = e - t;
      i.block ? this.addBlock(new Sl(o, n, i)) : (o || r || n >= Vh) && this.addLineDeco(n, r, o);
    } else e > t && this.span(t, e);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: t, to: e } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = t, this.lineEnd = e, this.writtenTo < t && ((this.writtenTo < t - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, t - 1)), this.nodes.push(null)), this.pos > t && this.nodes.push(new wt(this.pos - t, -1)), this.writtenTo = this.pos;
  }
  blankContent(t, e) {
    let i = new it(e - t);
    return this.oracle.doc.lineAt(t).to == e && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let t = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (t instanceof wt)
      return t;
    let e = new wt(0, -1);
    return this.nodes.push(e), e;
  }
  addBlock(t) {
    var e;
    this.enterLine();
    let i = (e = t.deco) === null || e === void 0 ? void 0 : e.type;
    i == _.WidgetAfter && !this.isCovered && this.ensureLine(), this.nodes.push(t), this.writtenTo = this.pos = this.pos + t.length, i != _.WidgetBefore && (this.covering = t);
  }
  addLineDeco(t, e, i) {
    let n = this.ensureLine();
    n.length += i, n.collapsed += i, n.widgetHeight = Math.max(n.widgetHeight, t), n.breaks += e, this.writtenTo = this.pos = this.pos + i;
  }
  finish(t) {
    let e = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(e instanceof wt) && !this.isCovered ? this.nodes.push(new wt(0, -1)) : (this.writtenTo < this.pos || e == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = t;
    for (let n of this.nodes)
      n instanceof wt && n.updateHeight(this.oracle, i), i += n ? n.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(t, e, i, n) {
    let r = new vs(i, t);
    return W.spans(e, i, n, r, 0), r.finish(i);
  }
}
function Wh(s, t, e) {
  let i = new zh();
  return W.compare(s, t, e, i, 0), i.changes;
}
class zh {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(t, e, i, n) {
    (t < e || i && i.heightRelevant || n && n.heightRelevant) && Kn(t, e, this.changes, 5);
  }
}
function qh(s, t) {
  let e = s.getBoundingClientRect(), i = s.ownerDocument, n = i.defaultView || window, r = Math.max(0, e.left), o = Math.min(n.innerWidth, e.right), l = Math.max(0, e.top), a = Math.min(n.innerHeight, e.bottom);
  for (let h = s.parentNode; h && h != i.body; )
    if (h.nodeType == 1) {
      let f = h, c = window.getComputedStyle(f);
      if ((f.scrollHeight > f.clientHeight || f.scrollWidth > f.clientWidth) && c.overflow != "visible") {
        let u = f.getBoundingClientRect();
        r = Math.max(r, u.left), o = Math.min(o, u.right), l = Math.max(l, u.top), a = h == s.parentNode ? u.bottom : Math.min(a, u.bottom);
      }
      h = c.position == "absolute" || c.position == "fixed" ? f.offsetParent : f.parentNode;
    } else if (h.nodeType == 11)
      h = h.host;
    else
      break;
  return {
    left: r - e.left,
    right: Math.max(r, o) - e.left,
    top: l - (e.top + t),
    bottom: Math.max(l, a) - (e.top + t)
  };
}
function jh(s, t) {
  let e = s.getBoundingClientRect();
  return {
    left: 0,
    right: e.right - e.left,
    top: t,
    bottom: e.bottom - (e.top + t)
  };
}
class un {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.size = i;
  }
  static same(t, e) {
    if (t.length != e.length)
      return !1;
    for (let i = 0; i < t.length; i++) {
      let n = t[i], r = e[i];
      if (n.from != r.from || n.to != r.to || n.size != r.size)
        return !1;
    }
    return !0;
  }
  draw(t) {
    return I.replace({ widget: new Kh(this.size, t) }).range(this.from, this.to);
  }
}
class Kh extends oe {
  constructor(t, e) {
    super(), this.size = t, this.vertical = e;
  }
  eq(t) {
    return t.size == this.size && t.vertical == this.vertical;
  }
  toDOM() {
    let t = document.createElement("div");
    return this.vertical ? t.style.height = this.size + "px" : (t.style.width = this.size + "px", t.style.height = "2px", t.style.display = "inline-block"), t;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class vr {
  constructor(t) {
    this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scrollTop = 0, this.scrolledToBottom = !0, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = kr, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = J.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let e = t.facet(ws).some((i) => typeof i != "function" && i.class == "cm-lineWrapping");
    this.heightOracle = new Nh(e), this.stateDeco = t.facet(Je).filter((i) => typeof i != "function"), this.heightMap = ut.empty().applyChanges(this.stateDeco, V.empty, this.heightOracle.setDoc(t.doc), [new Ot(0, 0, 0, t.doc.length)]), this.viewport = this.getViewport(0, null), this.updateViewportLines(), this.updateForViewport(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = I.set(this.lineGaps.map((i) => i.draw(!1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let t = [this.viewport], { main: e } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let n = i ? e.head : e.anchor;
      if (!t.some(({ from: r, to: o }) => n >= r && n <= o)) {
        let { from: r, to: o } = this.lineBlockAt(n);
        t.push(new pi(r, o));
      }
    }
    this.viewports = t.sort((i, n) => i.from - n.from), this.scaler = this.heightMap.height <= 7e6 ? kr : new Gh(this.heightOracle, this.heightMap, this.viewports);
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (t) => {
      this.viewportLines.push(this.scaler.scale == 1 ? t : We(t, this.scaler));
    });
  }
  update(t, e = null) {
    this.state = t.state;
    let i = this.stateDeco;
    this.stateDeco = this.state.facet(Je).filter((f) => typeof f != "function");
    let n = t.changedRanges, r = Ot.extendWithRanges(n, Wh(i, this.stateDeco, t ? t.changes : Z.empty(this.state.doc.length))), o = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, t.startState.doc, this.heightOracle.setDoc(this.state.doc), r), this.heightMap.height != o && (t.flags |= 2), l ? (this.scrollAnchorPos = t.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = this.heightMap.height);
    let a = r.length ? this.mapViewport(this.viewport, t.changes) : this.viewport;
    (e && (e.range.head < a.from || e.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, e));
    let h = !t.changes.empty || t.flags & 2 || a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, this.updateForViewport(), h && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, t.changes))), t.flags |= this.computeVisibleRanges(), e && (this.scrollTarget = e), !this.mustEnforceCursorAssoc && t.selectionSet && t.view.lineWrapping && t.state.selection.main.empty && t.state.selection.main.assoc && !t.state.facet(el) && (this.mustEnforceCursorAssoc = !0);
  }
  measure(t) {
    let e = t.contentDOM, i = window.getComputedStyle(e), n = this.heightOracle, r = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? J.RTL : J.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(r), l = e.getBoundingClientRect(), a = o || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let h = 0, f = 0, c = parseInt(i.paddingTop) || 0, u = parseInt(i.paddingBottom) || 0;
    (this.paddingTop != c || this.paddingBottom != u) && (this.paddingTop = c, this.paddingBottom = u, h |= 10), this.editorWidth != t.scrollDOM.clientWidth && (n.lineWrapping && (a = !0), this.editorWidth = t.scrollDOM.clientWidth, h |= 8), this.scrollTop != t.scrollDOM.scrollTop && (this.scrollAnchorHeight = -1, this.scrollTop = t.scrollDOM.scrollTop), this.scrolledToBottom = Ho(t.scrollDOM);
    let d = (this.printing ? jh : qh)(e, this.paddingTop), p = d.top - this.pixelViewport.top, g = d.bottom - this.pixelViewport.bottom;
    this.pixelViewport = d;
    let m = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (m != this.inView && (this.inView = m, m && (a = !0)), !this.inView && !this.scrollTarget)
      return 0;
    let y = l.width;
    if ((this.contentDOMWidth != y || this.editorHeight != t.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = t.scrollDOM.clientHeight, h |= 8), a) {
      let M = t.docView.measureVisibleLineHeights(this.viewport);
      if (n.mustRefreshForHeights(M) && (o = !0), o || n.lineWrapping && Math.abs(y - this.contentDOMWidth) > n.charWidth) {
        let { lineHeight: S, charWidth: b, textHeight: A } = t.docView.measureTextSize();
        o = S > 0 && n.refresh(r, S, b, A, y / b, M), o && (t.docView.minWidth = 0, h |= 8);
      }
      p > 0 && g > 0 ? f = Math.max(p, g) : p < 0 && g < 0 && (f = Math.min(p, g)), n.heightChanged = !1;
      for (let S of this.viewports) {
        let b = S.from == this.viewport.from ? M : t.docView.measureVisibleLineHeights(S);
        this.heightMap = (o ? ut.empty().applyChanges(this.stateDeco, V.empty, this.heightOracle, [new Ot(0, 0, 0, t.state.doc.length)]) : this.heightMap).updateHeight(n, 0, o, new Hh(S.from, b));
      }
      n.heightChanged && (h |= 2);
    }
    let w = !this.viewportIsAppropriate(this.viewport, f) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return w && (this.viewport = this.getViewport(f, this.scrollTarget)), this.updateForViewport(), (h & 2 || w) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, t)), h |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, t.docView.enforceCursorAssoc()), h;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(t, e) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, t / 1e3 / 2)), n = this.heightMap, r = this.heightOracle, { visibleTop: o, visibleBottom: l } = this, a = new pi(n.lineAt(o - i * 1e3, U.ByHeight, r, 0, 0).from, n.lineAt(l + (1 - i) * 1e3, U.ByHeight, r, 0, 0).to);
    if (e) {
      let { head: h } = e.range;
      if (h < a.from || h > a.to) {
        let f = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), c = n.lineAt(h, U.ByPos, r, 0, 0), u;
        e.y == "center" ? u = (c.top + c.bottom) / 2 - f / 2 : e.y == "start" || e.y == "nearest" && h < a.from ? u = c.top : u = c.bottom - f, a = new pi(n.lineAt(u - 1e3 / 2, U.ByHeight, r, 0, 0).from, n.lineAt(u + f + 1e3 / 2, U.ByHeight, r, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(t, e) {
    let i = e.mapPos(t.from, -1), n = e.mapPos(t.to, 1);
    return new pi(this.heightMap.lineAt(i, U.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(n, U.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: t, to: e }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: n } = this.heightMap.lineAt(t, U.ByPos, this.heightOracle, 0, 0), { bottom: r } = this.heightMap.lineAt(e, U.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (t == 0 || n <= o - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (e == this.state.doc.length || r >= l + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && n > o - 2 * 1e3 && r < l + 2 * 1e3;
  }
  mapLineGaps(t, e) {
    if (!t.length || e.empty)
      return t;
    let i = [];
    for (let n of t)
      e.touchesRange(n.from, n.to) || i.push(new un(e.mapPos(n.from), e.mapPos(n.to), n.size));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(t, e) {
    let i = this.heightOracle.lineWrapping, n = i ? 1e4 : 2e3, r = n >> 1, o = n << 1;
    if (this.defaultTextDirection != J.LTR && !i)
      return [];
    let l = [], a = (h, f, c, u) => {
      if (f - h < r)
        return;
      let d = this.state.selection.main, p = [d.from];
      d.empty || p.push(d.to);
      for (let m of p)
        if (m > h && m < f) {
          a(h, m - 10, c, u), a(m + 10, f, c, u);
          return;
        }
      let g = Uh(t, (m) => m.from >= c.from && m.to <= c.to && Math.abs(m.from - h) < r && Math.abs(m.to - f) < r && !p.some((y) => m.from < y && m.to > y));
      if (!g) {
        if (f < c.to && e && i && e.visibleRanges.some((m) => m.from <= f && m.to >= f)) {
          let m = e.moveToLineBoundary(v.cursor(f), !1, !0).head;
          m > h && (f = m);
        }
        g = new un(h, f, this.gapSize(c, h, f, u));
      }
      l.push(g);
    };
    for (let h of this.viewportLines) {
      if (h.length < o)
        continue;
      let f = $h(h.from, h.to, this.stateDeco);
      if (f.total < o)
        continue;
      let c = this.scrollTarget ? this.scrollTarget.range.head : null, u, d;
      if (i) {
        let p = n / this.heightOracle.lineLength * this.heightOracle.lineHeight, g, m;
        if (c != null) {
          let y = mi(f, c), w = ((this.visibleBottom - this.visibleTop) / 2 + p) / h.height;
          g = y - w, m = y + w;
        } else
          g = (this.visibleTop - h.top - p) / h.height, m = (this.visibleBottom - h.top + p) / h.height;
        u = gi(f, g), d = gi(f, m);
      } else {
        let p = f.total * this.heightOracle.charWidth, g = n * this.heightOracle.charWidth, m, y;
        if (c != null) {
          let w = mi(f, c), M = ((this.pixelViewport.right - this.pixelViewport.left) / 2 + g) / p;
          m = w - M, y = w + M;
        } else
          m = (this.pixelViewport.left - g) / p, y = (this.pixelViewport.right + g) / p;
        u = gi(f, m), d = gi(f, y);
      }
      u > h.from && a(h.from, u, h, f), d < h.to && a(d, h.to, h, f);
    }
    return l;
  }
  gapSize(t, e, i, n) {
    let r = mi(n, i) - mi(n, e);
    return this.heightOracle.lineWrapping ? t.height * r : n.total * this.heightOracle.charWidth * r;
  }
  updateLineGaps(t) {
    un.same(t, this.lineGaps) || (this.lineGaps = t, this.lineGapDeco = I.set(t.map((e) => e.draw(this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges() {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let e = [];
    W.spans(t, this.viewport.from, this.viewport.to, {
      span(n, r) {
        e.push({ from: n, to: r });
      },
      point() {
      }
    }, 20);
    let i = e.length != this.visibleRanges.length || this.visibleRanges.some((n, r) => n.from != e[r].from || n.to != e[r].to);
    return this.visibleRanges = e, i ? 4 : 0;
  }
  lineBlockAt(t) {
    return t >= this.viewport.from && t <= this.viewport.to && this.viewportLines.find((e) => e.from <= t && e.to >= t) || We(this.heightMap.lineAt(t, U.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(t) {
    return We(this.heightMap.lineAt(this.scaler.fromDOM(t), U.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  scrollAnchorAt(t) {
    let e = this.lineBlockAtHeight(t + 8);
    return e.from >= this.viewport.from || this.viewportLines[0].top - t > 200 ? e : this.viewportLines[0];
  }
  elementAtHeight(t) {
    return We(this.heightMap.blockAt(this.scaler.fromDOM(t), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class pi {
  constructor(t, e) {
    this.from = t, this.to = e;
  }
}
function $h(s, t, e) {
  let i = [], n = s, r = 0;
  return W.spans(e, s, t, {
    span() {
    },
    point(o, l) {
      o > n && (i.push({ from: n, to: o }), r += o - n), n = l;
    }
  }, 20), n < t && (i.push({ from: n, to: t }), r += t - n), { total: r, ranges: i };
}
function gi({ total: s, ranges: t }, e) {
  if (e <= 0)
    return t[0].from;
  if (e >= 1)
    return t[t.length - 1].to;
  let i = Math.floor(s * e);
  for (let n = 0; ; n++) {
    let { from: r, to: o } = t[n], l = o - r;
    if (i <= l)
      return r + i;
    i -= l;
  }
}
function mi(s, t) {
  let e = 0;
  for (let { from: i, to: n } of s.ranges) {
    if (t <= n) {
      e += t - i;
      break;
    }
    e += n - i;
  }
  return e / s.total;
}
function Uh(s, t) {
  for (let e of s)
    if (t(e))
      return e;
}
const kr = {
  toDOM(s) {
    return s;
  },
  fromDOM(s) {
    return s;
  },
  scale: 1
};
class Gh {
  constructor(t, e, i) {
    let n = 0, r = 0, o = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let h = e.lineAt(l, U.ByPos, t, 0, 0).top, f = e.lineAt(a, U.ByPos, t, 0, 0).bottom;
      return n += f - h, { from: l, to: a, top: h, bottom: f, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - n) / (e.height - n);
    for (let l of this.viewports)
      l.domTop = o + (l.top - r) * this.scale, o = l.domBottom = l.domTop + (l.bottom - l.top), r = l.bottom;
  }
  toDOM(t) {
    for (let e = 0, i = 0, n = 0; ; e++) {
      let r = e < this.viewports.length ? this.viewports[e] : null;
      if (!r || t < r.top)
        return n + (t - i) * this.scale;
      if (t <= r.bottom)
        return r.domTop + (t - r.top);
      i = r.bottom, n = r.domBottom;
    }
  }
  fromDOM(t) {
    for (let e = 0, i = 0, n = 0; ; e++) {
      let r = e < this.viewports.length ? this.viewports[e] : null;
      if (!r || t < r.domTop)
        return i + (t - n) / this.scale;
      if (t <= r.domBottom)
        return r.top + (t - r.domTop);
      i = r.bottom, n = r.domBottom;
    }
  }
}
function We(s, t) {
  if (t.scale == 1)
    return s;
  let e = t.toDOM(s.top), i = t.toDOM(s.bottom);
  return new Ft(s.from, s.length, e, i - e, Array.isArray(s._content) ? s._content.map((n) => We(n, t)) : s._content);
}
const yi = /* @__PURE__ */ D.define({ combine: (s) => s.join(" ") }), Zn = /* @__PURE__ */ D.define({ combine: (s) => s.indexOf(!0) > -1 }), ts = /* @__PURE__ */ te.newName(), Cl = /* @__PURE__ */ te.newName(), Al = /* @__PURE__ */ te.newName(), Ml = { "&light": "." + Cl, "&dark": "." + Al };
function es(s, t, e) {
  return new te(t, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (n) => {
        if (n == "&")
          return s;
        if (!e || !e[n])
          throw new RangeError(`Unsupported selector: ${n}`);
        return e[n];
      }) : s + " " + i;
    }
  });
}
const _h = /* @__PURE__ */ es("." + ts, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    boxSizing: "border-box",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    insetInlineStart: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-highlightSpace:before": {
    content: "attr(data-display)",
    position: "absolute",
    pointerEvents: "none",
    color: "#888"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, Ml);
class Jh {
  constructor(t, e, i, n) {
    this.typeOver = n, this.bounds = null, this.text = "";
    let { impreciseHead: r, impreciseAnchor: o } = t.docView;
    if (t.state.readOnly && e > -1)
      this.newSel = null;
    else if (e > -1 && (this.bounds = t.docView.domBoundsAround(e, i, 0))) {
      let l = r || o ? [] : Qh(t), a = new zo(l, t.state);
      a.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = a.text, this.newSel = Zh(l, this.bounds.from);
    } else {
      let l = t.observer.selectionRange, a = r && r.node == l.focusNode && r.offset == l.focusOffset || !Fn(t.contentDOM, l.focusNode) ? t.state.selection.main.head : t.docView.posFromDOM(l.focusNode, l.focusOffset), h = o && o.node == l.anchorNode && o.offset == l.anchorOffset || !Fn(t.contentDOM, l.anchorNode) ? t.state.selection.main.anchor : t.docView.posFromDOM(l.anchorNode, l.anchorOffset);
      this.newSel = v.single(h, a);
    }
  }
}
function Ol(s, t) {
  let e, { newSel: i } = t, n = s.state.selection.main, r = s.inputState.lastKeyTime > Date.now() - 100 ? s.inputState.lastKeyCode : -1;
  if (t.bounds) {
    let { from: o, to: l } = t.bounds, a = n.from, h = null;
    (r === 8 || O.android && t.text.length < l - o) && (a = n.to, h = "end");
    let f = Xh(s.state.doc.sliceString(o, l, xe), t.text, a - o, h);
    f && (O.chrome && r == 13 && f.toB == f.from + 2 && t.text.slice(f.from, f.toB) == xe + xe && f.toB--, e = {
      from: o + f.from,
      to: o + f.toA,
      insert: V.of(t.text.slice(f.from, f.toB).split(xe))
    });
  } else i && (!s.hasFocus && s.state.facet(en) || i.main.eq(n)) && (i = null);
  if (!e && !i)
    return !1;
  if (!e && t.typeOver && !n.empty && i && i.main.empty ? e = { from: n.from, to: n.to, insert: s.state.doc.slice(n.from, n.to) } : e && e.from >= n.from && e.to <= n.to && (e.from != n.from || e.to != n.to) && n.to - n.from - (e.to - e.from) <= 4 ? e = {
    from: n.from,
    to: n.to,
    insert: s.state.doc.slice(n.from, e.from).append(e.insert).append(s.state.doc.slice(e.to, n.to))
  } : (O.mac || O.android) && e && e.from == e.to && e.from == n.head - 1 && /^\. ?$/.test(e.insert.toString()) && s.contentDOM.getAttribute("autocorrect") == "off" ? (i && e.insert.length == 2 && (i = v.single(i.main.anchor - 1, i.main.head - 1)), e = { from: n.from, to: n.to, insert: V.of([" "]) }) : O.chrome && e && e.from == e.to && e.from == n.head && e.insert.toString() == `
 ` && s.lineWrapping && (i && (i = v.single(i.main.anchor - 1, i.main.head - 1)), e = { from: n.from, to: n.to, insert: V.of([" "]) }), e) {
    if (O.ios && s.inputState.flushIOSKey(s) || O.android && (e.from == n.from && e.to == n.to && e.insert.length == 1 && e.insert.lines == 2 && Me(s.contentDOM, "Enter", 13) || (e.from == n.from - 1 && e.to == n.to && e.insert.length == 0 || r == 8 && e.insert.length < e.to - e.from) && Me(s.contentDOM, "Backspace", 8) || e.from == n.from && e.to == n.to + 1 && e.insert.length == 0 && Me(s.contentDOM, "Delete", 46)))
      return !0;
    let o = e.insert.toString();
    s.inputState.composing >= 0 && s.inputState.composing++;
    let l, a = () => l || (l = Yh(s, e, i));
    return s.state.facet(Qo).some((h) => h(s, e.from, e.to, o, a)) || s.dispatch(a()), !0;
  } else if (i && !i.main.eq(n)) {
    let o = !1, l = "select";
    return s.inputState.lastSelectionTime > Date.now() - 50 && (s.inputState.lastSelectionOrigin == "select" && (o = !0), l = s.inputState.lastSelectionOrigin), s.dispatch({ selection: i, scrollIntoView: o, userEvent: l }), !0;
  } else
    return !1;
}
function Yh(s, t, e) {
  let i, n = s.state, r = n.selection.main;
  if (t.from >= r.from && t.to <= r.to && t.to - t.from >= (r.to - r.from) / 3 && (!e || e.main.empty && e.main.from == t.from + t.insert.length) && s.inputState.composing < 0) {
    let l = r.from < t.from ? n.sliceDoc(r.from, t.from) : "", a = r.to > t.to ? n.sliceDoc(t.to, r.to) : "";
    i = n.replaceSelection(s.state.toText(l + t.insert.sliceString(0, void 0, s.state.lineBreak) + a));
  } else {
    let l = n.changes(t), a = e && e.main.to <= l.newLength ? e.main : void 0;
    if (n.selection.ranges.length > 1 && s.inputState.composing >= 0 && t.to <= r.to && t.to >= r.to - 10) {
      let h = s.state.sliceDoc(t.from, t.to), f = cl(s) || s.state.doc.lineAt(r.head), c = r.to - t.to, u = r.to - r.from;
      i = n.changeByRange((d) => {
        if (d.from == r.from && d.to == r.to)
          return { changes: l, range: a || d.map(l) };
        let p = d.to - c, g = p - h.length;
        if (d.to - d.from != u || s.state.sliceDoc(g, p) != h || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        f && d.to >= f.from && d.from <= f.to)
          return { range: d };
        let m = n.changes({ from: g, to: p, insert: t.insert }), y = d.to - r.to;
        return {
          changes: m,
          range: a ? v.range(Math.max(0, a.anchor + y), Math.max(0, a.head + y)) : d.map(m)
        };
      });
    } else
      i = {
        changes: l,
        selection: a && n.selection.replaceRange(a)
      };
  }
  let o = "input.type";
  return (s.composing || s.inputState.compositionPendingChange && s.inputState.compositionEndedAt > Date.now() - 50) && (s.inputState.compositionPendingChange = !1, o += ".compose", s.inputState.compositionFirstChange && (o += ".start", s.inputState.compositionFirstChange = !1)), n.update(i, { userEvent: o, scrollIntoView: !0 });
}
function Xh(s, t, e, i) {
  let n = Math.min(s.length, t.length), r = 0;
  for (; r < n && s.charCodeAt(r) == t.charCodeAt(r); )
    r++;
  if (r == n && s.length == t.length)
    return null;
  let o = s.length, l = t.length;
  for (; o > 0 && l > 0 && s.charCodeAt(o - 1) == t.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let a = Math.max(0, r - Math.min(o, l));
    e -= o + a - r;
  }
  if (o < r && s.length < t.length) {
    let a = e <= r && e >= o ? r - e : 0;
    r -= a, l = r + (l - o), o = r;
  } else if (l < r) {
    let a = e <= r && e >= l ? r - e : 0;
    r -= a, o = r + (o - l), l = r;
  }
  return { from: r, toA: o, toB: l };
}
function Qh(s) {
  let t = [];
  if (s.root.activeElement != s.contentDOM)
    return t;
  let { anchorNode: e, anchorOffset: i, focusNode: n, focusOffset: r } = s.observer.selectionRange;
  return e && (t.push(new Xs(e, i)), (n != e || r != i) && t.push(new Xs(n, r))), t;
}
function Zh(s, t) {
  if (s.length == 0)
    return null;
  let e = s[0].pos, i = s.length == 2 ? s[1].pos : e;
  return e > -1 && i > -1 ? v.single(e + t, i + t) : null;
}
const tf = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, dn = O.ie && O.ie_version <= 11;
class ef {
  constructor(t) {
    this.view = t, this.active = !1, this.selectionRange = new ja(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.resizeContent = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.parentCheck = -1, this.dom = t.contentDOM, this.observer = new MutationObserver((e) => {
      for (let i of e)
        this.queue.push(i);
      (O.ie && O.ie_version <= 11 || O.ios && t.composing) && e.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), dn && (this.onCharData = (e) => {
      this.queue.push({
        target: e.target,
        type: "characterData",
        oldValue: e.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var e;
      ((e = this.view.docView) === null || e === void 0 ? void 0 : e.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(t.scrollDOM), this.resizeContent = new ResizeObserver(() => this.view.requestMeasure()), this.resizeContent.observe(t.contentDOM)), this.addWindowListeners(this.win = t.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((e) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), e.length > 0 && e[e.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((e) => {
      e.length > 0 && e[e.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(t) {
    this.view.inputState.runScrollHandlers(this.view, t), this.intersecting && this.view.measure();
  }
  onScroll(t) {
    this.intersecting && this.flush(!1), this.onScrollChanged(t);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint() {
    this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500);
  }
  updateGaps(t) {
    if (this.gapIntersection && (t.length != this.gaps.length || this.gaps.some((e, i) => e != t[i]))) {
      this.gapIntersection.disconnect();
      for (let e of t)
        this.gapIntersection.observe(e);
      this.gaps = t;
    }
  }
  onSelectionChange(t) {
    let e = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: i } = this, n = this.selectionRange;
    if (i.state.facet(en) ? i.root.activeElement != this.dom : !Ti(i.dom, n))
      return;
    let r = n.anchorNode && i.docView.nearest(n.anchorNode);
    if (r && r.ignoreEvent(t)) {
      e || (this.selectionChanged = !1);
      return;
    }
    (O.ie && O.ie_version <= 11 || O.android && O.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    n.focusNode && Vi(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: t } = this, e = O.safari && t.root.nodeType == 11 && Va(this.dom.ownerDocument) == this.dom && nf(this.view) || Fi(t.root);
    if (!e || this.selectionRange.eq(e))
      return !1;
    let i = Ti(this.dom, e);
    return i && !this.selectionChanged && t.inputState.lastFocusTime > Date.now() - 200 && t.inputState.lastTouchTime < Date.now() - 300 && $a(this.dom, e) ? (this.view.inputState.lastFocusTime = 0, t.docView.updateSelection(), !1) : (this.selectionRange.setRange(e), i && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(t, e) {
    this.selectionRange.set(t.node, t.offset, e.node, e.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let t = 0, e = null;
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !e && t < this.scrollTargets.length && this.scrollTargets[t] == i ? t++ : e || (e = this.scrollTargets.slice(0, t)), e && e.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (t < this.scrollTargets.length && !e && (e = this.scrollTargets.slice(0, t)), e) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = e)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(t) {
    if (!this.active)
      return t();
    try {
      return this.stop(), t();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, tf), dn && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), dn && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(t, e) {
    var i;
    if (!this.delayedAndroidKey) {
      let n = () => {
        let r = this.delayedAndroidKey;
        r && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = r.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && r.force && Me(this.dom, r.key, r.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(n);
    }
    (!this.delayedAndroidKey || t == "Enter") && (this.delayedAndroidKey = {
      key: t,
      keyCode: e,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let t of this.observer.takeRecords())
      this.queue.push(t);
    return this.queue;
  }
  processRecords() {
    let t = this.pendingRecords();
    t.length && (this.queue = []);
    let e = -1, i = -1, n = !1;
    for (let r of t) {
      let o = this.readMutation(r);
      o && (o.typeOver && (n = !0), e == -1 ? { from: e, to: i } = o : (e = Math.min(o.from, e), i = Math.max(o.to, i)));
    }
    return { from: e, to: i, typeOver: n };
  }
  readChange() {
    let { from: t, to: e, typeOver: i } = this.processRecords(), n = this.selectionChanged && Ti(this.dom, this.selectionRange);
    return t < 0 && !n ? null : (t > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1, new Jh(this.view, t, e, i));
  }
  // Apply pending changes, if any
  flush(t = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    t && this.readSelectionRange();
    let e = this.readChange();
    if (!e)
      return !1;
    let i = this.view.state, n = Ol(this.view, e);
    return this.view.state == i && this.view.update([]), n;
  }
  readMutation(t) {
    let e = this.view.docView.nearest(t.target);
    if (!e || e.ignoreMutation(t))
      return null;
    if (e.markDirty(t.type == "attributes"), t.type == "attributes" && (e.flags |= 4), t.type == "childList") {
      let i = Sr(e, t.previousSibling || t.target.previousSibling, -1), n = Sr(e, t.nextSibling || t.target.nextSibling, 1);
      return {
        from: i ? e.posAfter(i) : e.posAtStart,
        to: n ? e.posBefore(n) : e.posAtEnd,
        typeOver: !1
      };
    } else return t.type == "characterData" ? { from: e.posAtStart, to: e.posAtEnd, typeOver: t.target.nodeValue == t.oldValue } : null;
  }
  setWindow(t) {
    t != this.win && (this.removeWindowListeners(this.win), this.win = t, this.addWindowListeners(this.win));
  }
  addWindowListeners(t) {
    t.addEventListener("resize", this.onResize), t.addEventListener("beforeprint", this.onPrint), t.addEventListener("scroll", this.onScroll), t.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(t) {
    t.removeEventListener("scroll", this.onScroll), t.removeEventListener("resize", this.onResize), t.removeEventListener("beforeprint", this.onPrint), t.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  destroy() {
    var t, e, i, n;
    this.stop(), (t = this.intersection) === null || t === void 0 || t.disconnect(), (e = this.gapIntersection) === null || e === void 0 || e.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect(), (n = this.resizeContent) === null || n === void 0 || n.disconnect();
    for (let r of this.scrollTargets)
      r.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey);
  }
}
function Sr(s, t, e) {
  for (; t; ) {
    let i = $.get(t);
    if (i && i.parent == s)
      return i;
    let n = t.parentNode;
    t = n != s.dom ? n : e > 0 ? t.nextSibling : t.previousSibling;
  }
  return null;
}
function nf(s) {
  let t = null;
  function e(a) {
    a.preventDefault(), a.stopImmediatePropagation(), t = a.getTargetRanges()[0];
  }
  if (s.contentDOM.addEventListener("beforeinput", e, !0), s.dom.ownerDocument.execCommand("indent"), s.contentDOM.removeEventListener("beforeinput", e, !0), !t)
    return null;
  let i = t.startContainer, n = t.startOffset, r = t.endContainer, o = t.endOffset, l = s.docView.domAtPos(s.state.selection.main.anchor);
  return Vi(l.node, l.offset, r, o) && ([i, n, r, o] = [r, o, i, n]), { anchorNode: i, anchorOffset: n, focusNode: r, focusOffset: o };
}
class P {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(t = {}) {
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.style.cssText = "position: fixed; top: -10000px", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM);
    let { dispatch: e } = t;
    this.dispatchTransactions = t.dispatchTransactions || e && ((i) => i.forEach((n) => e(n, this))) || ((i) => this.update(i)), this.dispatch = this.dispatch.bind(this), this._root = t.root || Ka(t.parent) || document, this.viewState = new vr(t.state || F.create(t)), this.plugins = this.state.facet(Fe).map((i) => new hn(i));
    for (let i of this.plugins)
      i.update(this);
    this.observer = new ef(this), this.inputState = new kh(this), this.inputState.ensureHandlers(this, this.plugins), this.docView = new sr(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), t.parent && t.parent.appendChild(this.dom);
  }
  dispatch(...t) {
    let e = t.length == 1 && t[0] instanceof lt ? t : t.length == 1 && Array.isArray(t[0]) ? t[0] : [this.state.update(...t)];
    this.dispatchTransactions(e, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(t) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let e = !1, i = !1, n, r = this.state;
    for (let u of t) {
      if (u.startState != r)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      r = u.state;
    }
    if (this.destroyed) {
      this.viewState.state = r;
      return;
    }
    let o = this.hasFocus, l = 0, a = null;
    t.some((u) => u.annotation(xl)) ? (this.inputState.notifiedFocused = o, l = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, a = vl(r, o), a || (l = 1));
    let h = this.observer.delayedAndroidKey, f = null;
    if (h ? (this.observer.clearDelayedAndroidKey(), f = this.observer.readChange(), (f && !this.state.doc.eq(r.doc) || !this.state.selection.eq(r.selection)) && (f = null)) : this.observer.clear(), r.facet(F.phrases) != this.state.facet(F.phrases))
      return this.setState(r);
    n = qi.create(this, r, t), n.flags |= l;
    let c = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let u of t) {
        if (c && (c = c.map(u.changes)), u.scrollIntoView) {
          let { main: d } = u.state.selection;
          c = new zi(d.empty ? d : v.cursor(d.head, d.head > d.anchor ? -1 : 1));
        }
        for (let d of u.effects)
          d.is(ir) && (c = d.value);
      }
      this.viewState.update(n, c), this.bidiCache = ji.update(this.bidiCache, n.changes), n.empty || (this.updatePlugins(n), this.inputState.update(n)), e = this.docView.update(n), this.state.facet(Ve) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(t), this.docView.updateSelection(e, t.some((u) => u.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (n.startState.facet(yi) != n.state.facet(yi) && (this.viewState.mustMeasureContent = !0), (e || i || c || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), !n.empty)
      for (let u of this.state.facet($n))
        u(n);
    (a || f) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), f && !Ol(this, f) && h.force && Me(this.contentDOM, h.key, h.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(t) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = t;
      return;
    }
    this.updateState = 2;
    let e = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new vr(t), this.plugins = t.facet(Fe).map((i) => new hn(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView = new sr(this), this.inputState.ensureHandlers(this, this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    e && this.focus(), this.requestMeasure();
  }
  updatePlugins(t) {
    let e = t.startState.facet(Fe), i = t.state.facet(Fe);
    if (e != i) {
      let n = [];
      for (let r of i) {
        let o = e.indexOf(r);
        if (o < 0)
          n.push(new hn(r));
        else {
          let l = this.plugins[o];
          l.mustUpdate = t, n.push(l);
        }
      }
      for (let r of this.plugins)
        r.mustUpdate != t && r.destroy(this);
      this.plugins = n, this.pluginMap.clear(), this.inputState.ensureHandlers(this, this.plugins);
    } else
      for (let n of this.plugins)
        n.mustUpdate = t;
    for (let n = 0; n < this.plugins.length; n++)
      this.plugins[n].update(this);
  }
  /**
  @internal
  */
  measure(t = !0) {
    if (this.destroyed)
      return;
    this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.measureScheduled = 0, t && this.observer.forceFlush();
    let e = null, i = this.scrollDOM, { scrollTop: n } = i, { scrollAnchorPos: r, scrollAnchorHeight: o } = this.viewState;
    n != this.viewState.scrollTop && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let l = 0; ; l++) {
        if (o < 0)
          if (Ho(i))
            r = -1, o = this.viewState.heightMap.height;
          else {
            let d = this.viewState.scrollAnchorAt(n);
            r = d.from, o = d.top;
          }
        this.updateState = 1;
        let a = this.viewState.measure(this);
        if (!a && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (l > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let h = [];
        a & 4 || ([this.measureRequests, h] = [h, this.measureRequests]);
        let f = h.map((d) => {
          try {
            return d.read(this);
          } catch (p) {
            return Mt(this.state, p), Cr;
          }
        }), c = qi.create(this, this.state, []), u = !1;
        c.flags |= a, e ? e.flags |= a : e = c, this.updateState = 2, c.empty || (this.updatePlugins(c), this.inputState.update(c), this.updateAttrs(), u = this.docView.update(c));
        for (let d = 0; d < h.length; d++)
          if (f[d] != Cr)
            try {
              let p = h[d];
              p.write && p.write(f[d], this);
            } catch (p) {
              Mt(this.state, p);
            }
        if (u && this.docView.updateSelection(!0), !c.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null;
              continue;
            } else {
              let p = (r < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(r).top) - o;
              if (p > 1 || p < -1) {
                n = i.scrollTop = n + p, o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (e && !e.empty)
      for (let l of this.state.facet($n))
        l(e);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return ts + " " + (this.state.facet(Zn) ? Al : Cl) + " " + this.state.facet(yi);
  }
  updateAttrs() {
    let t = Ar(this, il, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), e = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: this.state.facet(en) ? "true" : "false",
      class: "cm-content",
      style: `${O.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (e["aria-readonly"] = "true"), Ar(this, ws, e);
    let i = this.observer.ignore(() => {
      let n = jn(this.contentDOM, this.contentAttrs, e), r = jn(this.dom, this.editorAttrs, t);
      return n || r;
    });
    return this.editorAttrs = t, this.contentAttrs = e, i;
  }
  showAnnouncements(t) {
    let e = !0;
    for (let i of t)
      for (let n of i.effects)
        if (n.is(P.announce)) {
          e && (this.announceDOM.textContent = ""), e = !1;
          let r = this.announceDOM.appendChild(document.createElement("div"));
          r.textContent = n.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Ve);
    let t = this.state.facet(P.cspNonce);
    te.mount(this.root, this.styleModules.concat(_h).reverse(), t ? { nonce: t } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(t) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), t) {
      if (this.measureRequests.indexOf(t) > -1)
        return;
      if (t.key != null) {
        for (let e = 0; e < this.measureRequests.length; e++)
          if (this.measureRequests[e].key === t.key) {
            this.measureRequests[e] = t;
            return;
          }
      }
      this.measureRequests.push(t);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(t) {
    let e = this.pluginMap.get(t);
    return (e === void 0 || e && e.spec != t) && this.pluginMap.set(t, e = this.plugins.find((i) => i.spec == t) || null), e && e.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(t) {
    return this.readMeasured(), this.viewState.elementAtHeight(t);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(t) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(t);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(t) {
    return this.viewState.lineBlockAt(t);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(t, e, i) {
    return cn(this, t, fr(this, t, e, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(t, e) {
    return cn(this, t, fr(this, t, e, (i) => xh(this, t.head, i)));
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(t, e, i = !0) {
    return wh(this, t, e, i);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(t, e, i) {
    return cn(this, t, vh(this, t, e, i));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(t) {
    return this.docView.domAtPos(t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(t, e = 0) {
    return this.docView.posFromDOM(t, e);
  }
  posAtCoords(t, e = !0) {
    return this.readMeasured(), dl(this, t, e);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(t, e = 1) {
    this.readMeasured();
    let i = this.docView.coordsAt(t, e);
    if (!i || i.left == i.right)
      return i;
    let n = this.state.doc.lineAt(t), r = this.bidiSpans(n), o = r[Qt.find(r, t - n.from, -1, e)];
    return Zi(i, o.dir == J.LTR == e > 0);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(t) {
    return this.readMeasured(), this.docView.coordsForChar(t);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(t) {
    return !this.state.facet(tl) || t < this.viewport.from || t > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(t));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(t) {
    if (t.length > sf)
      return hl(t.length);
    let e = this.textDirectionAt(t.from), i;
    for (let r of this.bidiCache)
      if (r.from == t.from && r.dir == e && (r.fresh || al(r.isolates, i = nr(this, t.from, t.to))))
        return r.order;
    i || (i = nr(this, t.from, t.to));
    let n = oh(t.text, e, i);
    return this.bidiCache.push(new ji(t.from, t.to, e, i, !0, n)), n;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var t;
    return (this.dom.ownerDocument.hasFocus() || O.safari && ((t = this.inputState) === null || t === void 0 ? void 0 : t.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Io(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(t) {
    this._root != t && (this._root = t, this.observer.setWindow((t.nodeType == 9 ? t : t.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    for (let t of this.plugins)
      t.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(t, e = {}) {
    return ir.of(new zi(typeof t == "number" ? v.cursor(t) : t, e.y, e.x, e.yMargin, e.xMargin));
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(t) {
    return tt.define(() => ({}), { eventHandlers: t });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(t, e) {
    let i = te.newName(), n = [yi.of(i), Ve.of(es(`.${i}`, t))];
    return e && e.dark && n.push(Zn.of(!0)), n;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(t) {
    return Be.lowest(Ve.of(es("." + ts, t, Ml)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(t) {
    var e;
    let i = t.querySelector(".cm-content"), n = i && $.get(i) || $.get(t);
    return ((e = n == null ? void 0 : n.rootView) === null || e === void 0 ? void 0 : e.view) || null;
  }
}
P.styleModule = Ve;
P.inputHandler = Qo;
P.focusChangeEffect = Zo;
P.perLineTextDirection = tl;
P.exceptionSink = Xo;
P.updateListener = $n;
P.editable = en;
P.mouseSelectionStyle = Yo;
P.dragMovesSelection = Jo;
P.clickAddsSelectionRange = _o;
P.decorations = Je;
P.atomicRanges = xs;
P.bidiIsolatedRanges = nl;
P.scrollMargins = sl;
P.darkTheme = Zn;
P.cspNonce = /* @__PURE__ */ D.define({ combine: (s) => s.length ? s[0] : "" });
P.contentAttributes = ws;
P.editorAttributes = il;
P.lineWrapping = /* @__PURE__ */ P.contentAttributes.of({ class: "cm-lineWrapping" });
P.announce = /* @__PURE__ */ L.define();
const sf = 4096, Cr = {};
class ji {
  constructor(t, e, i, n, r, o) {
    this.from = t, this.to = e, this.dir = i, this.isolates = n, this.fresh = r, this.order = o;
  }
  static update(t, e) {
    if (e.empty && !t.some((r) => r.fresh))
      return t;
    let i = [], n = t.length ? t[t.length - 1].dir : J.LTR;
    for (let r = Math.max(0, t.length - 10); r < t.length; r++) {
      let o = t[r];
      o.dir == n && !e.touchesRange(o.from, o.to) && i.push(new ji(e.mapPos(o.from, 1), e.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return i;
  }
}
function Ar(s, t, e) {
  for (let i = s.state.facet(t), n = i.length - 1; n >= 0; n--) {
    let r = i[n], o = typeof r == "function" ? r(s) : r;
    o && qn(o, e);
  }
  return e;
}
const rf = O.mac ? "mac" : O.windows ? "win" : O.linux ? "linux" : "key";
function of(s, t) {
  const e = s.split(/-(?!$)/);
  let i = e[e.length - 1];
  i == "Space" && (i = " ");
  let n, r, o, l;
  for (let a = 0; a < e.length - 1; ++a) {
    const h = e[a];
    if (/^(cmd|meta|m)$/i.test(h))
      l = !0;
    else if (/^a(lt)?$/i.test(h))
      n = !0;
    else if (/^(c|ctrl|control)$/i.test(h))
      r = !0;
    else if (/^s(hift)?$/i.test(h))
      o = !0;
    else if (/^mod$/i.test(h))
      t == "mac" ? l = !0 : r = !0;
    else
      throw new Error("Unrecognized modifier name: " + h);
  }
  return n && (i = "Alt-" + i), r && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function bi(s, t, e) {
  return t.altKey && (s = "Alt-" + s), t.ctrlKey && (s = "Ctrl-" + s), t.metaKey && (s = "Meta-" + s), e !== !1 && t.shiftKey && (s = "Shift-" + s), s;
}
const lf = /* @__PURE__ */ Be.default(/* @__PURE__ */ P.domEventHandlers({
  keydown(s, t) {
    return Tl(Dl(t.state), s, t, "editor");
  }
})), ks = /* @__PURE__ */ D.define({ enables: lf }), Mr = /* @__PURE__ */ new WeakMap();
function Dl(s) {
  let t = s.facet(ks), e = Mr.get(t);
  return e || Mr.set(t, e = hf(t.reduce((i, n) => i.concat(n), []))), e;
}
function ed(s, t, e) {
  return Tl(Dl(s.state), t, s, e);
}
let Jt = null;
const af = 4e3;
function hf(s, t = rf) {
  let e = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), n = (o, l) => {
    let a = i[o];
    if (a == null)
      i[o] = l;
    else if (a != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, r = (o, l, a, h, f) => {
    var c, u;
    let d = e[o] || (e[o] = /* @__PURE__ */ Object.create(null)), p = l.split(/ (?!$)/).map((y) => of(y, t));
    for (let y = 1; y < p.length; y++) {
      let w = p.slice(0, y).join(" ");
      n(w, !0), d[w] || (d[w] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(M) => {
          let S = Jt = { view: M, prefix: w, scope: o };
          return setTimeout(() => {
            Jt == S && (Jt = null);
          }, af), !0;
        }]
      });
    }
    let g = p.join(" ");
    n(g, !1);
    let m = d[g] || (d[g] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((u = (c = d._any) === null || c === void 0 ? void 0 : c.run) === null || u === void 0 ? void 0 : u.slice()) || []
    });
    a && m.run.push(a), h && (m.preventDefault = !0), f && (m.stopPropagation = !0);
  };
  for (let o of s) {
    let l = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let h of l) {
        let f = e[h] || (e[h] = /* @__PURE__ */ Object.create(null));
        f._any || (f._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        for (let c in f)
          f[c].run.push(o.any);
      }
    let a = o[t] || o.key;
    if (a)
      for (let h of l)
        r(h, a, o.run, o.preventDefault, o.stopPropagation), o.shift && r(h, "Shift-" + a, o.shift, o.preventDefault, o.stopPropagation);
  }
  return e;
}
function Tl(s, t, e, i) {
  let n = Fa(t), r = ot(n, 0), o = Dt(r) == n.length && n != " ", l = "", a = !1, h = !1, f = !1;
  Jt && Jt.view == e && Jt.scope == i && (l = Jt.prefix + " ", gl.indexOf(t.keyCode) < 0 && (h = !0, Jt = null));
  let c = /* @__PURE__ */ new Set(), u = (m) => {
    if (m) {
      for (let y of m.run)
        if (!c.has(y) && (c.add(y), y(e, t)))
          return m.stopPropagation && (f = !0), !0;
      m.preventDefault && (m.stopPropagation && (f = !0), h = !0);
    }
    return !1;
  }, d = s[i], p, g;
  return d && (u(d[l + bi(n, t, !o)]) ? a = !0 : o && (t.altKey || t.metaKey || t.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(O.windows && t.ctrlKey && t.altKey) && (p = ee[t.keyCode]) && p != n ? (u(d[l + bi(p, t, !0)]) || t.shiftKey && (g = _e[t.keyCode]) != n && g != p && u(d[l + bi(g, t, !1)])) && (a = !0) : o && t.shiftKey && u(d[l + bi(n, t, !0)]) && (a = !0), !a && u(d._any) && (a = !0)), h && (a = !0), a && f && t.stopPropagation(), a;
}
class ri {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(t, e, i, n, r) {
    this.className = t, this.left = e, this.top = i, this.width = n, this.height = r;
  }
  draw() {
    let t = document.createElement("div");
    return t.className = this.className, this.adjust(t), t;
  }
  update(t, e) {
    return e.className != this.className ? !1 : (this.adjust(t), !0);
  }
  adjust(t) {
    t.style.left = this.left + "px", t.style.top = this.top + "px", this.width != null && (t.style.width = this.width + "px"), t.style.height = this.height + "px";
  }
  eq(t) {
    return this.left == t.left && this.top == t.top && this.width == t.width && this.height == t.height && this.className == t.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(t, e, i) {
    if (i.empty) {
      let n = t.coordsAtPos(i.head, i.assoc || 1);
      if (!n)
        return [];
      let r = Pl(t);
      return [new ri(e, n.left - r.left, n.top - r.top, null, n.bottom - n.top)];
    } else
      return ff(t, e, i);
  }
}
function Pl(s) {
  let t = s.scrollDOM.getBoundingClientRect();
  return { left: (s.textDirection == J.LTR ? t.left : t.right - s.scrollDOM.clientWidth) - s.scrollDOM.scrollLeft, top: t.top - s.scrollDOM.scrollTop };
}
function Or(s, t, e) {
  let i = v.cursor(t);
  return {
    from: Math.max(e.from, s.moveToLineBoundary(i, !1, !0).from),
    to: Math.min(e.to, s.moveToLineBoundary(i, !0, !0).from),
    type: _.Text
  };
}
function ff(s, t, e) {
  if (e.to <= s.viewport.from || e.from >= s.viewport.to)
    return [];
  let i = Math.max(e.from, s.viewport.from), n = Math.min(e.to, s.viewport.to), r = s.textDirection == J.LTR, o = s.contentDOM, l = o.getBoundingClientRect(), a = Pl(s), h = o.querySelector(".cm-line"), f = h && window.getComputedStyle(h), c = l.left + (f ? parseInt(f.paddingLeft) + Math.min(0, parseInt(f.textIndent)) : 0), u = l.right - (f ? parseInt(f.paddingRight) : 0), d = Yn(s, i), p = Yn(s, n), g = d.type == _.Text ? d : null, m = p.type == _.Text ? p : null;
  if (g && (s.lineWrapping || d.widgetLineBreaks) && (g = Or(s, i, g)), m && (s.lineWrapping || p.widgetLineBreaks) && (m = Or(s, n, m)), g && m && g.from == m.from)
    return w(M(e.from, e.to, g));
  {
    let b = g ? M(e.from, null, g) : S(d, !1), A = m ? M(null, e.to, m) : S(p, !0), C = [];
    return (g || d).to < (m || p).from - (g && m ? 1 : 0) || d.widgetLineBreaks > 1 && b.bottom + s.defaultLineHeight / 2 < A.top ? C.push(y(c, b.bottom, u, A.top)) : b.bottom < A.top && s.elementAtHeight((b.bottom + A.top) / 2).type == _.Text && (b.bottom = A.top = (b.bottom + A.top) / 2), w(b).concat(C).concat(w(A));
  }
  function y(b, A, C, N) {
    return new ri(
      t,
      b - a.left,
      A - a.top - 0.01,
      C - b,
      N - A + 0.01
      /* C.Epsilon */
    );
  }
  function w({ top: b, bottom: A, horizontal: C }) {
    let N = [];
    for (let R = 0; R < C.length; R += 2)
      N.push(y(C[R], b, C[R + 1], A));
    return N;
  }
  function M(b, A, C) {
    let N = 1e9, R = -1e9, q = [];
    function B(H, K, ht, bt, Pt) {
      let et = s.coordsAtPos(H, H == C.to ? -2 : 2), kt = s.coordsAtPos(ht, ht == C.from ? 2 : -2);
      !et || !kt || (N = Math.min(et.top, kt.top, N), R = Math.max(et.bottom, kt.bottom, R), Pt == J.LTR ? q.push(r && K ? c : et.left, r && bt ? u : kt.right) : q.push(!r && bt ? c : kt.left, !r && K ? u : et.right));
    }
    let T = b ?? C.from, z = A ?? C.to;
    for (let H of s.visibleRanges)
      if (H.to > T && H.from < z)
        for (let K = Math.max(H.from, T), ht = Math.min(H.to, z); ; ) {
          let bt = s.state.doc.lineAt(K);
          for (let Pt of s.bidiSpans(bt)) {
            let et = Pt.from + bt.from, kt = Pt.to + bt.from;
            if (et >= ht)
              break;
            kt > K && B(Math.max(et, K), b == null && et <= T, Math.min(kt, ht), A == null && kt >= z, Pt.dir);
          }
          if (K = bt.to + 1, K >= ht)
            break;
        }
    return q.length == 0 && B(T, b == null, z, A == null, s.textDirection), { top: N, bottom: R, horizontal: q };
  }
  function S(b, A) {
    let C = l.top + (A ? b.top : b.bottom);
    return { top: C, bottom: C, horizontal: [] };
  }
}
function cf(s, t) {
  return s.constructor == t.constructor && s.eq(t);
}
class uf {
  constructor(t, e) {
    this.view = t, this.layer = e, this.drawn = [], this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = t.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), e.above && this.dom.classList.add("cm-layer-above"), e.class && this.dom.classList.add(e.class), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(t.state), t.requestMeasure(this.measureReq), e.mount && e.mount(this.dom, t);
  }
  update(t) {
    t.startState.facet(Ri) != t.state.facet(Ri) && this.setOrder(t.state), (this.layer.update(t, this.dom) || t.geometryChanged) && t.view.requestMeasure(this.measureReq);
  }
  setOrder(t) {
    let e = 0, i = t.facet(Ri);
    for (; e < i.length && i[e] != this.layer; )
      e++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - e);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  draw(t) {
    if (t.length != this.drawn.length || t.some((e, i) => !cf(e, this.drawn[i]))) {
      let e = this.dom.firstChild, i = 0;
      for (let n of t)
        n.update && e && n.constructor && this.drawn[i].constructor && n.update(e, this.drawn[i]) ? (e = e.nextSibling, i++) : this.dom.insertBefore(n.draw(), e);
      for (; e; ) {
        let n = e.nextSibling;
        e.remove(), e = n;
      }
      this.drawn = t;
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const Ri = /* @__PURE__ */ D.define();
function Bl(s) {
  return [
    tt.define((t) => new uf(t, s)),
    Ri.of(s)
  ];
}
const Rl = !O.ios, Xe = /* @__PURE__ */ D.define({
  combine(s) {
    return Re(s, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0
    }, {
      cursorBlinkRate: (t, e) => Math.min(t, e),
      drawRangeCursor: (t, e) => t || e
    });
  }
});
function id(s = {}) {
  return [
    Xe.of(s),
    df,
    pf,
    gf,
    el.of(!0)
  ];
}
function El(s) {
  return s.startState.facet(Xe) != s.state.facet(Xe);
}
const df = /* @__PURE__ */ Bl({
  above: !0,
  markers(s) {
    let { state: t } = s, e = t.facet(Xe), i = [];
    for (let n of t.selection.ranges) {
      let r = n == t.selection.main;
      if (n.empty ? !r || Rl : e.drawRangeCursor) {
        let o = r ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = n.empty ? n : v.cursor(n.head, n.head > n.anchor ? -1 : 1);
        for (let a of ri.forRange(s, o, l))
          i.push(a);
      }
    }
    return i;
  },
  update(s, t) {
    s.transactions.some((i) => i.selection) && (t.style.animationName = t.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let e = El(s);
    return e && Dr(s.state, t), s.docChanged || s.selectionSet || e;
  },
  mount(s, t) {
    Dr(t.state, s);
  },
  class: "cm-cursorLayer"
});
function Dr(s, t) {
  t.style.animationDuration = s.facet(Xe).cursorBlinkRate + "ms";
}
const pf = /* @__PURE__ */ Bl({
  above: !1,
  markers(s) {
    return s.state.selection.ranges.map((t) => t.empty ? [] : ri.forRange(s, "cm-selectionBackground", t)).reduce((t, e) => t.concat(e));
  },
  update(s, t) {
    return s.docChanged || s.selectionSet || s.viewportChanged || El(s);
  },
  class: "cm-selectionLayer"
}), Ll = {
  ".cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" }
  }
};
Rl && (Ll[".cm-line"].caretColor = "transparent !important");
const gf = /* @__PURE__ */ Be.highest(/* @__PURE__ */ P.theme(Ll)), Il = /* @__PURE__ */ L.define({
  map(s, t) {
    return s == null ? null : t.mapPos(s);
  }
}), ze = /* @__PURE__ */ yt.define({
  create() {
    return null;
  },
  update(s, t) {
    return s != null && (s = t.changes.mapPos(s)), t.effects.reduce((e, i) => i.is(Il) ? i.value : e, s);
  }
}), mf = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.view = s, this.cursor = null, this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
  }
  update(s) {
    var t;
    let e = s.state.field(ze);
    e == null ? this.cursor != null && ((t = this.cursor) === null || t === void 0 || t.remove(), this.cursor = null) : (this.cursor || (this.cursor = this.view.scrollDOM.appendChild(document.createElement("div")), this.cursor.className = "cm-dropCursor"), (s.startState.field(ze) != e || s.docChanged || s.geometryChanged) && this.view.requestMeasure(this.measureReq));
  }
  readPos() {
    let s = this.view.state.field(ze), t = s != null && this.view.coordsAtPos(s);
    if (!t)
      return null;
    let e = this.view.scrollDOM.getBoundingClientRect();
    return {
      left: t.left - e.left + this.view.scrollDOM.scrollLeft,
      top: t.top - e.top + this.view.scrollDOM.scrollTop,
      height: t.bottom - t.top
    };
  }
  drawCursor(s) {
    this.cursor && (s ? (this.cursor.style.left = s.left + "px", this.cursor.style.top = s.top + "px", this.cursor.style.height = s.height + "px") : this.cursor.style.left = "-100000px");
  }
  destroy() {
    this.cursor && this.cursor.remove();
  }
  setDropPos(s) {
    this.view.state.field(ze) != s && this.view.dispatch({ effects: Il.of(s) });
  }
}, {
  eventHandlers: {
    dragover(s) {
      this.setDropPos(this.view.posAtCoords({ x: s.clientX, y: s.clientY }));
    },
    dragleave(s) {
      (s.target == this.view.contentDOM || !this.view.contentDOM.contains(s.relatedTarget)) && this.setDropPos(null);
    },
    dragend() {
      this.setDropPos(null);
    },
    drop() {
      this.setDropPos(null);
    }
  }
});
function nd() {
  return [ze, mf];
}
function Tr(s, t, e, i, n) {
  t.lastIndex = 0;
  for (let r = s.iterRange(e, i), o = e, l; !r.next().done; o += r.value.length)
    if (!r.lineBreak)
      for (; l = t.exec(r.value); )
        n(o + l.index, l);
}
function yf(s, t) {
  let e = s.visibleRanges;
  if (e.length == 1 && e[0].from == s.viewport.from && e[0].to == s.viewport.to)
    return e;
  let i = [];
  for (let { from: n, to: r } of e)
    n = Math.max(s.state.doc.lineAt(n).from, n - t), r = Math.min(s.state.doc.lineAt(r).to, r + t), i.length && i[i.length - 1].to >= n ? i[i.length - 1].to = r : i.push({ from: n, to: r });
  return i;
}
class bf {
  /**
  Create a decorator.
  */
  constructor(t) {
    const { regexp: e, decoration: i, decorate: n, boundary: r, maxLength: o = 1e3 } = t;
    if (!e.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = e, n)
      this.addMatch = (l, a, h, f) => n(f, h, h + l[0].length, l, a);
    else if (typeof i == "function")
      this.addMatch = (l, a, h, f) => {
        let c = i(l, a, h);
        c && f(h, h + l[0].length, c);
      };
    else if (i)
      this.addMatch = (l, a, h, f) => f(h, h + l[0].length, i);
    else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = r, this.maxLength = o;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(t) {
    let e = new pe(), i = e.add.bind(e);
    for (let { from: n, to: r } of yf(t, this.maxLength))
      Tr(t.state.doc, this.regexp, n, r, (o, l) => this.addMatch(l, t, o, i));
    return e.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(t, e) {
    let i = 1e9, n = -1;
    return t.docChanged && t.changes.iterChanges((r, o, l, a) => {
      a > t.view.viewport.from && l < t.view.viewport.to && (i = Math.min(l, i), n = Math.max(a, n));
    }), t.viewportChanged || n - i > 1e3 ? this.createDeco(t.view) : n > -1 ? this.updateRange(t.view, e.map(t.changes), i, n) : e;
  }
  updateRange(t, e, i, n) {
    for (let r of t.visibleRanges) {
      let o = Math.max(r.from, i), l = Math.min(r.to, n);
      if (l > o) {
        let a = t.state.doc.lineAt(o), h = a.to < l ? t.state.doc.lineAt(l) : a, f = Math.max(r.from, a.from), c = Math.min(r.to, h.to);
        if (this.boundary) {
          for (; o > a.from; o--)
            if (this.boundary.test(a.text[o - 1 - a.from])) {
              f = o;
              break;
            }
          for (; l < h.to; l++)
            if (this.boundary.test(h.text[l - h.from])) {
              c = l;
              break;
            }
        }
        let u = [], d, p = (g, m, y) => u.push(y.range(g, m));
        if (a == h)
          for (this.regexp.lastIndex = f - a.from; (d = this.regexp.exec(a.text)) && d.index < c - a.from; )
            this.addMatch(d, t, d.index + a.from, p);
        else
          Tr(t.state.doc, this.regexp, f, c, (g, m) => this.addMatch(m, t, g, p));
        e = e.update({ filterFrom: f, filterTo: c, filter: (g, m) => g < f || m > c, add: u });
      }
    }
    return e;
  }
}
const is = /x/.unicode != null ? "gu" : "g", wf = /* @__PURE__ */ new RegExp(`[\0-\b
--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]`, is), xf = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let pn = null;
function vf() {
  var s;
  if (pn == null && typeof document < "u" && document.body) {
    let t = document.body.style;
    pn = ((s = t.tabSize) !== null && s !== void 0 ? s : t.MozTabSize) != null;
  }
  return pn || !1;
}
const Ei = /* @__PURE__ */ D.define({
  combine(s) {
    let t = Re(s, {
      render: null,
      specialChars: wf,
      addSpecialChars: null
    });
    return (t.replaceTabs = !vf()) && (t.specialChars = new RegExp("	|" + t.specialChars.source, is)), t.addSpecialChars && (t.specialChars = new RegExp(t.specialChars.source + "|" + t.addSpecialChars.source, is)), t;
  }
});
function sd(s = {}) {
  return [Ei.of(s), kf()];
}
let Pr = null;
function kf() {
  return Pr || (Pr = tt.fromClass(class {
    constructor(s) {
      this.view = s, this.decorations = I.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(s.state.facet(Ei)), this.decorations = this.decorator.createDeco(s);
    }
    makeDecorator(s) {
      return new bf({
        regexp: s.specialChars,
        decoration: (t, e, i) => {
          let { doc: n } = e.state, r = ot(t[0], 0);
          if (r == 9) {
            let o = n.lineAt(i), l = e.state.tabSize, a = ms(o.text, l, i - o.from);
            return I.replace({ widget: new Mf((l - a % l) * this.view.defaultCharacterWidth) });
          }
          return this.decorationCache[r] || (this.decorationCache[r] = I.replace({ widget: new Af(s, r) }));
        },
        boundary: s.replaceTabs ? void 0 : /[^]/
      });
    }
    update(s) {
      let t = s.state.facet(Ei);
      s.startState.facet(Ei) != t ? (this.decorator = this.makeDecorator(t), this.decorations = this.decorator.createDeco(s.view)) : this.decorations = this.decorator.updateDeco(s, this.decorations);
    }
  }, {
    decorations: (s) => s.decorations
  }));
}
const Sf = "•";
function Cf(s) {
  return s >= 32 ? Sf : s == 10 ? "␤" : String.fromCharCode(9216 + s);
}
class Af extends oe {
  constructor(t, e) {
    super(), this.options = t, this.code = e;
  }
  eq(t) {
    return t.code == this.code;
  }
  toDOM(t) {
    let e = Cf(this.code), i = t.state.phrase("Control character") + " " + (xf[this.code] || "0x" + this.code.toString(16)), n = this.options.render && this.options.render(this.code, i, e);
    if (n)
      return n;
    let r = document.createElement("span");
    return r.textContent = e, r.title = i, r.setAttribute("aria-label", i), r.className = "cm-specialChar", r;
  }
  ignoreEvent() {
    return !1;
  }
}
class Mf extends oe {
  constructor(t) {
    super(), this.width = t;
  }
  eq(t) {
    return t.width == this.width;
  }
  toDOM() {
    let t = document.createElement("span");
    return t.textContent = "	", t.className = "cm-tab", t.style.width = this.width + "px", t;
  }
  ignoreEvent() {
    return !1;
  }
}
function rd() {
  return Df;
}
const Of = /* @__PURE__ */ I.line({ class: "cm-activeLine" }), Df = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.decorations = this.getDeco(s);
  }
  update(s) {
    (s.docChanged || s.selectionSet) && (this.decorations = this.getDeco(s.view));
  }
  getDeco(s) {
    let t = -1, e = [];
    for (let i of s.state.selection.ranges) {
      let n = s.lineBlockAt(i.head);
      n.from > t && (e.push(Of.range(n.from)), t = n.from);
    }
    return I.set(e);
  }
}, {
  decorations: (s) => s.decorations
});
class Tf extends oe {
  constructor(t) {
    super(), this.content = t;
  }
  toDOM() {
    let t = document.createElement("span");
    return t.className = "cm-placeholder", t.style.pointerEvents = "none", t.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : this.content), typeof this.content == "string" ? t.setAttribute("aria-label", "placeholder " + this.content) : t.setAttribute("aria-hidden", "true"), t;
  }
  coordsAt(t) {
    let e = t.firstChild ? De(t.firstChild) : [];
    if (!e.length)
      return null;
    let i = window.getComputedStyle(t.parentNode), n = Zi(e[0], i.direction != "rtl"), r = parseInt(i.lineHeight);
    return n.bottom - n.top > r * 1.5 ? { left: n.left, right: n.right, top: n.top, bottom: n.top + r } : n;
  }
  ignoreEvent() {
    return !1;
  }
}
function od(s) {
  return tt.fromClass(class {
    constructor(t) {
      this.view = t, this.placeholder = s ? I.set([I.widget({ widget: new Tf(s), side: 1 }).range(0)]) : I.none;
    }
    get decorations() {
      return this.view.state.doc.length ? I.none : this.placeholder;
    }
  }, { decorations: (t) => t.decorations });
}
const ns = 2e3;
function Pf(s, t, e) {
  let i = Math.min(t.line, e.line), n = Math.max(t.line, e.line), r = [];
  if (t.off > ns || e.off > ns || t.col < 0 || e.col < 0) {
    let o = Math.min(t.off, e.off), l = Math.max(t.off, e.off);
    for (let a = i; a <= n; a++) {
      let h = s.doc.line(a);
      h.length <= l && r.push(v.range(h.from + o, h.to + l));
    }
  } else {
    let o = Math.min(t.col, e.col), l = Math.max(t.col, e.col);
    for (let a = i; a <= n; a++) {
      let h = s.doc.line(a), f = In(h.text, o, s.tabSize, !0);
      if (f < 0)
        r.push(v.cursor(h.to));
      else {
        let c = In(h.text, l, s.tabSize);
        r.push(v.range(h.from + f, h.from + c));
      }
    }
  }
  return r;
}
function Bf(s, t) {
  let e = s.coordsAtPos(s.viewport.from);
  return e ? Math.round(Math.abs((e.left - t) / s.defaultCharacterWidth)) : -1;
}
function Br(s, t) {
  let e = s.posAtCoords({ x: t.clientX, y: t.clientY }, !1), i = s.state.doc.lineAt(e), n = e - i.from, r = n > ns ? -1 : n == i.length ? Bf(s, t.clientX) : ms(i.text, s.state.tabSize, e - i.from);
  return { line: i.number, col: r, off: n };
}
function Rf(s, t) {
  let e = Br(s, t), i = s.state.selection;
  return e ? {
    update(n) {
      if (n.docChanged) {
        let r = n.changes.mapPos(n.startState.doc.line(e.line).from), o = n.state.doc.lineAt(r);
        e = { line: o.number, col: e.col, off: Math.min(e.off, o.length) }, i = i.map(n.changes);
      }
    },
    get(n, r, o) {
      let l = Br(s, n);
      if (!l)
        return i;
      let a = Pf(s.state, e, l);
      return a.length ? o ? v.create(a.concat(i.ranges)) : v.create(a) : i;
    }
  } : null;
}
function ld(s) {
  let t = (e) => e.altKey && e.button == 0;
  return P.mouseSelectionStyle.of((e, i) => t(i) ? Rf(e, i) : null);
}
const Ef = {
  Alt: [18, (s) => !!s.altKey],
  Control: [17, (s) => !!s.ctrlKey],
  Shift: [16, (s) => !!s.shiftKey],
  Meta: [91, (s) => !!s.metaKey]
}, Lf = { style: "cursor: crosshair" };
function ad(s = {}) {
  let [t, e] = Ef[s.key || "Alt"], i = tt.fromClass(class {
    constructor(n) {
      this.view = n, this.isDown = !1;
    }
    set(n) {
      this.isDown != n && (this.isDown = n, this.view.update([]));
    }
  }, {
    eventHandlers: {
      keydown(n) {
        this.set(n.keyCode == t || e(n));
      },
      keyup(n) {
        (n.keyCode == t || !e(n)) && this.set(!1);
      },
      mousemove(n) {
        this.set(e(n));
      }
    }
  });
  return [
    i,
    P.contentAttributes.of((n) => {
      var r;
      return !((r = n.plugin(i)) === null || r === void 0) && r.isDown ? Lf : null;
    })
  ];
}
const wi = "-10000px";
class Nl {
  constructor(t, e, i) {
    this.facet = e, this.createTooltipView = i, this.input = t.state.facet(e), this.tooltips = this.input.filter((n) => n), this.tooltipViews = this.tooltips.map(i);
  }
  update(t) {
    var e;
    let i = t.state.facet(this.facet), n = i.filter((o) => o);
    if (i === this.input) {
      for (let o of this.tooltipViews)
        o.update && o.update(t);
      return !1;
    }
    let r = [];
    for (let o = 0; o < n.length; o++) {
      let l = n[o], a = -1;
      if (l) {
        for (let h = 0; h < this.tooltips.length; h++) {
          let f = this.tooltips[h];
          f && f.create == l.create && (a = h);
        }
        if (a < 0)
          r[o] = this.createTooltipView(l);
        else {
          let h = r[o] = this.tooltipViews[a];
          h.update && h.update(t);
        }
      }
    }
    for (let o of this.tooltipViews)
      r.indexOf(o) < 0 && (o.dom.remove(), (e = o.destroy) === null || e === void 0 || e.call(o));
    return this.input = i, this.tooltips = n, this.tooltipViews = r, !0;
  }
}
function If(s) {
  let { win: t } = s;
  return { top: 0, left: 0, bottom: t.innerHeight, right: t.innerWidth };
}
const gn = /* @__PURE__ */ D.define({
  combine: (s) => {
    var t, e, i;
    return {
      position: O.ios ? "absolute" : ((t = s.find((n) => n.position)) === null || t === void 0 ? void 0 : t.position) || "fixed",
      parent: ((e = s.find((n) => n.parent)) === null || e === void 0 ? void 0 : e.parent) || null,
      tooltipSpace: ((i = s.find((n) => n.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || If
    };
  }
}), Rr = /* @__PURE__ */ new WeakMap(), Hl = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.view = s, this.inView = !0, this.lastTransaction = 0, this.measureTimeout = -1;
    let t = s.state.facet(gn);
    this.position = t.position, this.parent = t.parent, this.classes = s.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.manager = new Nl(s, Ss, (e) => this.createTooltip(e)), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((e) => {
      Date.now() > this.lastTransaction - 50 && e.length > 0 && e[e.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), s.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let s of this.manager.tooltipViews)
        this.intersectionObserver.observe(s.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(s) {
    s.transactions.length && (this.lastTransaction = Date.now());
    let t = this.manager.update(s);
    t && this.observeIntersection();
    let e = t || s.geometryChanged, i = s.state.facet(gn);
    if (i.position != this.position) {
      this.position = i.position;
      for (let n of this.manager.tooltipViews)
        n.dom.style.position = this.position;
      e = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let n of this.manager.tooltipViews)
        this.container.appendChild(n.dom);
      e = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    e && this.maybeMeasure();
  }
  createTooltip(s) {
    let t = s.create(this.view);
    if (t.dom.classList.add("cm-tooltip"), s.arrow && !t.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let e = document.createElement("div");
      e.className = "cm-tooltip-arrow", t.dom.appendChild(e);
    }
    return t.dom.style.position = this.position, t.dom.style.top = wi, this.container.appendChild(t.dom), t.mount && t.mount(this.view), t;
  }
  destroy() {
    var s, t;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let e of this.manager.tooltipViews)
      e.dom.remove(), (s = e.destroy) === null || s === void 0 || s.call(e);
    (t = this.intersectionObserver) === null || t === void 0 || t.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let s = this.view.dom.getBoundingClientRect();
    return {
      editor: s,
      parent: this.parent ? this.container.getBoundingClientRect() : s,
      pos: this.manager.tooltips.map((t, e) => {
        let i = this.manager.tooltipViews[e];
        return i.getCoords ? i.getCoords(t.pos) : this.view.coordsAtPos(t.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: t }) => t.getBoundingClientRect()),
      space: this.view.state.facet(gn).tooltipSpace(this.view)
    };
  }
  writeMeasure(s) {
    var t;
    let { editor: e, space: i } = s, n = [];
    for (let r = 0; r < this.manager.tooltips.length; r++) {
      let o = this.manager.tooltips[r], l = this.manager.tooltipViews[r], { dom: a } = l, h = s.pos[r], f = s.size[r];
      if (!h || h.bottom <= Math.max(e.top, i.top) || h.top >= Math.min(e.bottom, i.bottom) || h.right < Math.max(e.left, i.left) - 0.1 || h.left > Math.min(e.right, i.right) + 0.1) {
        a.style.top = wi;
        continue;
      }
      let c = o.arrow ? l.dom.querySelector(".cm-tooltip-arrow") : null, u = c ? 7 : 0, d = f.right - f.left, p = (t = Rr.get(l)) !== null && t !== void 0 ? t : f.bottom - f.top, g = l.offset || Hf, m = this.view.textDirection == J.LTR, y = f.width > i.right - i.left ? m ? i.left : i.right - f.width : m ? Math.min(h.left - (c ? 14 : 0) + g.x, i.right - d) : Math.max(i.left, h.left - d + (c ? 14 : 0) - g.x), w = !!o.above;
      !o.strictSide && (w ? h.top - (f.bottom - f.top) - g.y < i.top : h.bottom + (f.bottom - f.top) + g.y > i.bottom) && w == i.bottom - h.bottom > h.top - i.top && (w = !w);
      let M = (w ? h.top - i.top : i.bottom - h.bottom) - u;
      if (M < p && l.resize !== !1) {
        if (M < this.view.defaultLineHeight) {
          a.style.top = wi;
          continue;
        }
        Rr.set(l, p), a.style.height = (p = M) + "px";
      } else a.style.height && (a.style.height = "");
      let S = w ? h.top - p - u - g.y : h.bottom + u + g.y, b = y + d;
      if (l.overlap !== !0)
        for (let A of n)
          A.left < b && A.right > y && A.top < S + p && A.bottom > S && (S = w ? A.top - p - 2 - u : A.bottom + u + 2);
      this.position == "absolute" ? (a.style.top = S - s.parent.top + "px", a.style.left = y - s.parent.left + "px") : (a.style.top = S + "px", a.style.left = y + "px"), c && (c.style.left = `${h.left + (m ? g.x : -g.x) - (y + 14 - 7)}px`), l.overlap !== !0 && n.push({ left: y, top: S, right: b, bottom: S + p }), a.classList.toggle("cm-tooltip-above", w), a.classList.toggle("cm-tooltip-below", !w), l.positioned && l.positioned(s.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let s of this.manager.tooltipViews)
        s.dom.style.top = wi;
  }
}, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    }
  }
}), Nf = /* @__PURE__ */ P.baseTheme({
  ".cm-tooltip": {
    zIndex: 100,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: "7px",
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent"
    },
    ".cm-tooltip-above &": {
      bottom: "-7px",
      "&:before": {
        borderTop: "7px solid #bbb"
      },
      "&:after": {
        borderTop: "7px solid #f5f5f5",
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: "-7px",
      "&:before": {
        borderBottom: "7px solid #bbb"
      },
      "&:after": {
        borderBottom: "7px solid #f5f5f5",
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), Hf = { x: 0, y: 0 }, Ss = /* @__PURE__ */ D.define({
  enables: [Hl, Nf]
}), Ki = /* @__PURE__ */ D.define();
class Cs {
  // Needs to be static so that host tooltip instances always match
  static create(t) {
    return new Cs(t);
  }
  constructor(t) {
    this.view = t, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new Nl(t, Ki, (e) => this.createHostedView(e));
  }
  createHostedView(t) {
    let e = t.create(this.view);
    return e.dom.classList.add("cm-tooltip-section"), this.dom.appendChild(e.dom), this.mounted && e.mount && e.mount(this.view), e;
  }
  mount(t) {
    for (let e of this.manager.tooltipViews)
      e.mount && e.mount(t);
    this.mounted = !0;
  }
  positioned(t) {
    for (let e of this.manager.tooltipViews)
      e.positioned && e.positioned(t);
  }
  update(t) {
    this.manager.update(t);
  }
  destroy() {
    var t;
    for (let e of this.manager.tooltipViews)
      (t = e.destroy) === null || t === void 0 || t.call(e);
  }
}
const Ff = /* @__PURE__ */ Ss.compute([Ki], (s) => {
  let t = s.facet(Ki).filter((e) => e);
  return t.length === 0 ? null : {
    pos: Math.min(...t.map((e) => e.pos)),
    end: Math.max(...t.filter((e) => e.end != null).map((e) => e.end)),
    create: Cs.create,
    above: t[0].above,
    arrow: t.some((e) => e.arrow)
  };
});
class Vf {
  constructor(t, e, i, n, r) {
    this.view = t, this.source = e, this.field = i, this.setHover = n, this.hoverTime = r, this.hoverTimeout = -1, this.restartTimeout = -1, this.pending = null, this.lastMove = { x: 0, y: 0, target: t.dom, time: 0 }, this.checkHover = this.checkHover.bind(this), t.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this)), t.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update() {
    this.pending && (this.pending = null, clearTimeout(this.restartTimeout), this.restartTimeout = setTimeout(() => this.startHover(), 20));
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    if (this.hoverTimeout = -1, this.active)
      return;
    let t = Date.now() - this.lastMove.time;
    t < this.hoverTime ? this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - t) : this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { view: t, lastMove: e } = this, i = t.docView.nearest(e.target);
    if (!i)
      return;
    let n, r = 1;
    if (i instanceof Xt)
      n = i.posAtStart;
    else {
      if (n = t.posAtCoords(e), n == null)
        return;
      let l = t.coordsAtPos(n);
      if (!l || e.y < l.top || e.y > l.bottom || e.x < l.left - t.defaultCharacterWidth || e.x > l.right + t.defaultCharacterWidth)
        return;
      let a = t.bidiSpans(t.state.doc.lineAt(n)).find((f) => f.from <= n && f.to >= n), h = a && a.dir == J.RTL ? -1 : 1;
      r = e.x < l.left ? -h : h;
    }
    let o = this.source(t, n, r);
    if (o != null && o.then) {
      let l = this.pending = { pos: n };
      o.then((a) => {
        this.pending == l && (this.pending = null, a && t.dispatch({ effects: this.setHover.of(a) }));
      }, (a) => Mt(t.state, a, "hover tooltip"));
    } else o && t.dispatch({ effects: this.setHover.of(o) });
  }
  mousemove(t) {
    var e;
    this.lastMove = { x: t.clientX, y: t.clientY, target: t.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let i = this.active;
    if (i && !Er(this.lastMove.target) || this.pending) {
      let { pos: n } = i || this.pending, r = (e = i == null ? void 0 : i.end) !== null && e !== void 0 ? e : n;
      (n == r ? this.view.posAtCoords(this.lastMove) != n : !Wf(
        this.view,
        n,
        r,
        t.clientX,
        t.clientY,
        6
        /* Hover.MaxDist */
      )) && (this.view.dispatch({ effects: this.setHover.of(null) }), this.pending = null);
    }
  }
  mouseleave(t) {
    clearTimeout(this.hoverTimeout), this.hoverTimeout = -1, this.active && !Er(t.relatedTarget) && this.view.dispatch({ effects: this.setHover.of(null) });
  }
  destroy() {
    clearTimeout(this.hoverTimeout), this.view.dom.removeEventListener("mouseleave", this.mouseleave), this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
function Er(s) {
  for (let t = s; t; t = t.parentNode)
    if (t.nodeType == 1 && t.classList.contains("cm-tooltip"))
      return !0;
  return !1;
}
function Wf(s, t, e, i, n, r) {
  let o = document.createRange(), l = s.domAtPos(t), a = s.domAtPos(e);
  o.setEnd(a.node, a.offset), o.setStart(l.node, l.offset);
  let h = o.getClientRects();
  o.detach();
  for (let f = 0; f < h.length; f++) {
    let c = h[f];
    if (Math.max(c.top - n, n - c.bottom, c.left - i, i - c.right) <= r)
      return !0;
  }
  return !1;
}
function hd(s, t = {}) {
  let e = L.define(), i = yt.define({
    create() {
      return null;
    },
    update(n, r) {
      if (n && (t.hideOnChange && (r.docChanged || r.selection) || t.hideOn && t.hideOn(r, n)))
        return null;
      if (n && r.docChanged) {
        let o = r.changes.mapPos(n.pos, -1, st.TrackDel);
        if (o == null)
          return null;
        let l = Object.assign(/* @__PURE__ */ Object.create(null), n);
        l.pos = o, n.end != null && (l.end = r.changes.mapPos(n.end)), n = l;
      }
      for (let o of r.effects)
        o.is(e) && (n = o.value), o.is(zf) && (n = null);
      return n;
    },
    provide: (n) => Ki.from(n)
  });
  return [
    i,
    tt.define((n) => new Vf(
      n,
      s,
      i,
      e,
      t.hoverTime || 300
      /* Hover.Time */
    )),
    Ff
  ];
}
function Fl(s, t) {
  let e = s.plugin(Hl);
  if (!e)
    return null;
  let i = e.manager.tooltips.indexOf(t);
  return i < 0 ? null : e.manager.tooltipViews[i];
}
const zf = /* @__PURE__ */ L.define(), Lr = /* @__PURE__ */ D.define({
  combine(s) {
    let t, e;
    for (let i of s)
      t = t || i.topContainer, e = e || i.bottomContainer;
    return { topContainer: t, bottomContainer: e };
  }
});
function fd(s, t) {
  let e = s.plugin(Vl), i = e ? e.specs.indexOf(t) : -1;
  return i > -1 ? e.panels[i] : null;
}
const Vl = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.input = s.state.facet(Nr), this.specs = this.input.filter((e) => e), this.panels = this.specs.map((e) => e(s));
    let t = s.state.facet(Lr);
    this.top = new xi(s, !0, t.topContainer), this.bottom = new xi(s, !1, t.bottomContainer), this.top.sync(this.panels.filter((e) => e.top)), this.bottom.sync(this.panels.filter((e) => !e.top));
    for (let e of this.panels)
      e.dom.classList.add("cm-panel"), e.mount && e.mount();
  }
  update(s) {
    let t = s.state.facet(Lr);
    this.top.container != t.topContainer && (this.top.sync([]), this.top = new xi(s.view, !0, t.topContainer)), this.bottom.container != t.bottomContainer && (this.bottom.sync([]), this.bottom = new xi(s.view, !1, t.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let e = s.state.facet(Nr);
    if (e != this.input) {
      let i = e.filter((a) => a), n = [], r = [], o = [], l = [];
      for (let a of i) {
        let h = this.specs.indexOf(a), f;
        h < 0 ? (f = a(s.view), l.push(f)) : (f = this.panels[h], f.update && f.update(s)), n.push(f), (f.top ? r : o).push(f);
      }
      this.specs = i, this.panels = n, this.top.sync(r), this.bottom.sync(o);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(s);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (s) => P.scrollMargins.of((t) => {
    let e = t.plugin(s);
    return e && { top: e.top.scrollMargin(), bottom: e.bottom.scrollMargin() };
  })
});
class xi {
  constructor(t, e, i) {
    this.view = t, this.top = e, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(t) {
    for (let e of this.panels)
      e.destroy && t.indexOf(e) < 0 && e.destroy();
    this.panels = t, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let e = this.container || this.view.dom;
      e.insertBefore(this.dom, this.top ? e.firstChild : null);
    }
    let t = this.dom.firstChild;
    for (let e of this.panels)
      if (e.dom.parentNode == this.dom) {
        for (; t != e.dom; )
          t = Ir(t);
        t = t.nextSibling;
      } else
        this.dom.insertBefore(e.dom, t);
    for (; t; )
      t = Ir(t);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let t of this.classes.split(" "))
        t && this.container.classList.remove(t);
      for (let t of (this.classes = this.view.themeClasses).split(" "))
        t && this.container.classList.add(t);
    }
  }
}
function Ir(s) {
  let t = s.nextSibling;
  return s.remove(), t;
}
const Nr = /* @__PURE__ */ D.define({
  enables: Vl
});
class Ut extends de {
  /**
  @internal
  */
  compare(t) {
    return this == t || this.constructor == t.constructor && this.eq(t);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(t) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(t) {
  }
}
Ut.prototype.elementClass = "";
Ut.prototype.toDOM = void 0;
Ut.prototype.mapMode = st.TrackBefore;
Ut.prototype.startSide = Ut.prototype.endSide = -1;
Ut.prototype.point = !0;
const Li = /* @__PURE__ */ D.define(), qf = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => W.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}, $e = /* @__PURE__ */ D.define();
function jf(s) {
  return [Wl(), $e.of(Object.assign(Object.assign({}, qf), s))];
}
const Hr = /* @__PURE__ */ D.define({
  combine: (s) => s.some((t) => t)
});
function Wl(s) {
  return [
    Kf
  ];
}
const Kf = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.view = s, this.prevViewport = s.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight + "px", this.gutters = s.state.facet($e).map((t) => new Vr(s, t));
    for (let t of this.gutters)
      this.dom.appendChild(t.dom);
    this.fixed = !s.state.facet(Hr), this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), s.scrollDOM.insertBefore(this.dom, s.contentDOM);
  }
  update(s) {
    if (this.updateGutters(s)) {
      let t = this.prevViewport, e = s.view.viewport, i = Math.min(t.to, e.to) - Math.max(t.from, e.from);
      this.syncGutters(i < (e.to - e.from) * 0.8);
    }
    s.geometryChanged && (this.dom.style.minHeight = this.view.contentHeight + "px"), this.view.state.facet(Hr) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : ""), this.prevViewport = s.view.viewport;
  }
  syncGutters(s) {
    let t = this.dom.nextSibling;
    s && this.dom.remove();
    let e = W.iter(this.view.state.facet(Li), this.view.viewport.from), i = [], n = this.gutters.map((r) => new $f(r, this.view.viewport, -this.view.documentPadding.top));
    for (let r of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(r.type)) {
        let o = !0;
        for (let l of r.type)
          if (l.type == _.Text && o) {
            ss(e, i, l.from);
            for (let a of n)
              a.line(this.view, l, i);
            o = !1;
          } else if (l.widget)
            for (let a of n)
              a.widget(this.view, l);
      } else if (r.type == _.Text) {
        ss(e, i, r.from);
        for (let o of n)
          o.line(this.view, r, i);
      }
    for (let r of n)
      r.finish();
    s && this.view.scrollDOM.insertBefore(this.dom, t);
  }
  updateGutters(s) {
    let t = s.startState.facet($e), e = s.state.facet($e), i = s.docChanged || s.heightChanged || s.viewportChanged || !W.eq(s.startState.facet(Li), s.state.facet(Li), s.view.viewport.from, s.view.viewport.to);
    if (t == e)
      for (let n of this.gutters)
        n.update(s) && (i = !0);
    else {
      i = !0;
      let n = [];
      for (let r of e) {
        let o = t.indexOf(r);
        o < 0 ? n.push(new Vr(this.view, r)) : (this.gutters[o].update(s), n.push(this.gutters[o]));
      }
      for (let r of this.gutters)
        r.dom.remove(), n.indexOf(r) < 0 && r.destroy();
      for (let r of n)
        this.dom.appendChild(r.dom);
      this.gutters = n;
    }
    return i;
  }
  destroy() {
    for (let s of this.gutters)
      s.destroy();
    this.dom.remove();
  }
}, {
  provide: (s) => P.scrollMargins.of((t) => {
    let e = t.plugin(s);
    return !e || e.gutters.length == 0 || !e.fixed ? null : t.textDirection == J.LTR ? { left: e.dom.offsetWidth } : { right: e.dom.offsetWidth };
  })
});
function Fr(s) {
  return Array.isArray(s) ? s : [s];
}
function ss(s, t, e) {
  for (; s.value && s.from <= e; )
    s.from == e && t.push(s.value), s.next();
}
class $f {
  constructor(t, e, i) {
    this.gutter = t, this.height = i, this.i = 0, this.cursor = W.iter(t.markers, e.from);
  }
  addElement(t, e, i) {
    let { gutter: n } = this, r = e.top - this.height;
    if (this.i == n.elements.length) {
      let o = new zl(t, e.height, r, i);
      n.elements.push(o), n.dom.appendChild(o.dom);
    } else
      n.elements[this.i].update(t, e.height, r, i);
    this.height = e.bottom, this.i++;
  }
  line(t, e, i) {
    let n = [];
    ss(this.cursor, n, e.from), i.length && (n = n.concat(i));
    let r = this.gutter.config.lineMarker(t, e, n);
    r && n.unshift(r);
    let o = this.gutter;
    n.length == 0 && !o.config.renderEmptyElements || this.addElement(t, e, n);
  }
  widget(t, e) {
    let i = this.gutter.config.widgetMarker(t, e.widget, e);
    i && this.addElement(t, e, [i]);
  }
  finish() {
    let t = this.gutter;
    for (; t.elements.length > this.i; ) {
      let e = t.elements.pop();
      t.dom.removeChild(e.dom), e.destroy();
    }
  }
}
class Vr {
  constructor(t, e) {
    this.view = t, this.config = e, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in e.domEventHandlers)
      this.dom.addEventListener(i, (n) => {
        let r = n.target, o;
        if (r != this.dom && this.dom.contains(r)) {
          for (; r.parentNode != this.dom; )
            r = r.parentNode;
          let a = r.getBoundingClientRect();
          o = (a.top + a.bottom) / 2;
        } else
          o = n.clientY;
        let l = t.lineBlockAtHeight(o - t.documentTop);
        e.domEventHandlers[i](t, l, n) && n.preventDefault();
      });
    this.markers = Fr(e.markers(t)), e.initialSpacer && (this.spacer = new zl(t, 0, 0, [e.initialSpacer(t)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(t) {
    let e = this.markers;
    if (this.markers = Fr(this.config.markers(t.view)), this.spacer && this.config.updateSpacer) {
      let n = this.config.updateSpacer(this.spacer.markers[0], t);
      n != this.spacer.markers[0] && this.spacer.update(t.view, 0, 0, [n]);
    }
    let i = t.view.viewport;
    return !W.eq(this.markers, e, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(t) : !1);
  }
  destroy() {
    for (let t of this.elements)
      t.destroy();
  }
}
class zl {
  constructor(t, e, i, n) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(t, e, i, n);
  }
  update(t, e, i, n) {
    this.height != e && (this.dom.style.height = (this.height = e) + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), Uf(this.markers, n) || this.setMarkers(t, n);
  }
  setMarkers(t, e) {
    let i = "cm-gutterElement", n = this.dom.firstChild;
    for (let r = 0, o = 0; ; ) {
      let l = o, a = r < e.length ? e[r++] : null, h = !1;
      if (a) {
        let f = a.elementClass;
        f && (i += " " + f);
        for (let c = o; c < this.markers.length; c++)
          if (this.markers[c].compare(a)) {
            l = c, h = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; o < l; ) {
        let f = this.markers[o++];
        if (f.toDOM) {
          f.destroy(n);
          let c = n.nextSibling;
          n.remove(), n = c;
        }
      }
      if (!a)
        break;
      a.toDOM && (h ? n = n.nextSibling : this.dom.insertBefore(a.toDOM(t), n)), h && o++;
    }
    this.dom.className = i, this.markers = e;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function Uf(s, t) {
  if (s.length != t.length)
    return !1;
  for (let e = 0; e < s.length; e++)
    if (!s[e].compare(t[e]))
      return !1;
  return !0;
}
const Gf = /* @__PURE__ */ D.define(), ve = /* @__PURE__ */ D.define({
  combine(s) {
    return Re(s, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(t, e) {
        let i = Object.assign({}, t);
        for (let n in e) {
          let r = i[n], o = e[n];
          i[n] = r ? (l, a, h) => r(l, a, h) || o(l, a, h) : o;
        }
        return i;
      }
    });
  }
});
class mn extends Ut {
  constructor(t) {
    super(), this.number = t;
  }
  eq(t) {
    return this.number == t.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function yn(s, t) {
  return s.state.facet(ve).formatNumber(t, s.state);
}
const _f = /* @__PURE__ */ $e.compute([ve], (s) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(t) {
    return t.state.facet(Gf);
  },
  lineMarker(t, e, i) {
    return i.some((n) => n.toDOM) ? null : new mn(yn(t, t.state.doc.lineAt(e.from).number));
  },
  widgetMarker: () => null,
  lineMarkerChange: (t) => t.startState.facet(ve) != t.state.facet(ve),
  initialSpacer(t) {
    return new mn(yn(t, Wr(t.state.doc.lines)));
  },
  updateSpacer(t, e) {
    let i = yn(e.view, Wr(e.view.state.doc.lines));
    return i == t.number ? t : new mn(i);
  },
  domEventHandlers: s.facet(ve).domEventHandlers
}));
function cd(s = {}) {
  return [
    ve.of(s),
    Wl(),
    _f
  ];
}
function Wr(s) {
  let t = 9;
  for (; t < s; )
    t = t * 10 + 9;
  return t;
}
const Jf = /* @__PURE__ */ new class extends Ut {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), Yf = /* @__PURE__ */ Li.compute(["selection"], (s) => {
  let t = [], e = -1;
  for (let i of s.selection.ranges) {
    let n = s.doc.lineAt(i.head).from;
    n > e && (e = n, t.push(Jf.range(n)));
  }
  return W.of(t);
});
function ud() {
  return Yf;
}
const Xf = 1024;
let Qf = 0;
class At {
  constructor(t, e) {
    this.from = t, this.to = e;
  }
}
class E {
  /**
  Create a new node prop type.
  */
  constructor(t = {}) {
    this.id = Qf++, this.perNode = !!t.perNode, this.deserialize = t.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(t) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof t != "function" && (t = gt.match(t)), (e) => {
      let i = t(e);
      return i === void 0 ? null : [this, i];
    };
  }
}
E.closedBy = new E({ deserialize: (s) => s.split(" ") });
E.openedBy = new E({ deserialize: (s) => s.split(" ") });
E.group = new E({ deserialize: (s) => s.split(" ") });
E.isolate = new E({ deserialize: (s) => {
  if (s && s != "rtl" && s != "ltr" && s != "auto")
    throw new RangeError("Invalid value for isolate: " + s);
  return s || "auto";
} });
E.contextHash = new E({ perNode: !0 });
E.lookAhead = new E({ perNode: !0 });
E.mounted = new E({ perNode: !0 });
class Qe {
  constructor(t, e, i) {
    this.tree = t, this.overlay = e, this.parser = i;
  }
  /**
  @internal
  */
  static get(t) {
    return t && t.props && t.props[E.mounted.id];
  }
}
const Zf = /* @__PURE__ */ Object.create(null);
class gt {
  /**
  @internal
  */
  constructor(t, e, i, n = 0) {
    this.name = t, this.props = e, this.id = i, this.flags = n;
  }
  /**
  Define a node type.
  */
  static define(t) {
    let e = t.props && t.props.length ? /* @__PURE__ */ Object.create(null) : Zf, i = (t.top ? 1 : 0) | (t.skipped ? 2 : 0) | (t.error ? 4 : 0) | (t.name == null ? 8 : 0), n = new gt(t.name || "", e, t.id, i);
    if (t.props) {
      for (let r of t.props)
        if (Array.isArray(r) || (r = r(n)), r) {
          if (r[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          e[r[0].id] = r[1];
        }
    }
    return n;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(t) {
    return this.props[t.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(t) {
    if (typeof t == "string") {
      if (this.name == t)
        return !0;
      let e = this.prop(E.group);
      return e ? e.indexOf(t) > -1 : !1;
    }
    return this.id == t;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(t) {
    let e = /* @__PURE__ */ Object.create(null);
    for (let i in t)
      for (let n of i.split(" "))
        e[n] = t[i];
    return (i) => {
      for (let n = i.prop(E.group), r = -1; r < (n ? n.length : 0); r++) {
        let o = e[r < 0 ? i.name : n[r]];
        if (o)
          return o;
      }
    };
  }
}
gt.none = new gt(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class ql {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(t) {
    this.types = t;
    for (let e = 0; e < t.length; e++)
      if (t[e].id != e)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...t) {
    let e = [];
    for (let i of this.types) {
      let n = null;
      for (let r of t) {
        let o = r(i);
        o && (n || (n = Object.assign({}, i.props)), n[o[0].id] = o[1]);
      }
      e.push(n ? new gt(i.name, n, i.id, i.flags) : i);
    }
    return new ql(e);
  }
}
const vi = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap();
var G;
(function(s) {
  s[s.ExcludeBuffers = 1] = "ExcludeBuffers", s[s.IncludeAnonymous = 2] = "IncludeAnonymous", s[s.IgnoreMounts = 4] = "IgnoreMounts", s[s.IgnoreOverlays = 8] = "IgnoreOverlays";
})(G || (G = {}));
class Q {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(t, e, i, n, r) {
    if (this.type = t, this.children = e, this.positions = i, this.length = n, this.props = null, r && r.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of r)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let t = Qe.get(this);
    if (t && !t.overlay)
      return t.tree.toString();
    let e = "";
    for (let i of this.children) {
      let n = i.toString();
      n && (e && (e += ","), e += n);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (e.length ? "(" + e + ")" : "") : e;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(t = 0) {
    return new $i(this.topNode, t);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(t, e = 0, i = 0) {
    let n = vi.get(this) || this.topNode, r = new $i(n);
    return r.moveTo(t, e), vi.set(this, r._tree), r;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new at(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(t, e = 0) {
    let i = Ze(vi.get(this) || this.topNode, t, e, !1);
    return vi.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(t, e = 0) {
    let i = Ze(zr.get(this) || this.topNode, t, e, !0);
    return zr.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(t, e = 0) {
    return ic(this, t, e);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(t) {
    let { enter: e, leave: i, from: n = 0, to: r = this.length } = t, o = t.mode || 0, l = (o & G.IncludeAnonymous) > 0;
    for (let a = this.cursor(o | G.IncludeAnonymous); ; ) {
      let h = !1;
      if (a.from <= r && a.to >= n && (!l && a.type.isAnonymous || e(a) !== !1)) {
        if (a.firstChild())
          continue;
        h = !0;
      }
      for (; h && i && (l || !a.type.isAnonymous) && i(a), !a.nextSibling(); ) {
        if (!a.parent())
          return;
        h = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(t) {
    return t.perNode ? this.props ? this.props[t.id] : void 0 : this.type.prop(t);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let t = [];
    if (this.props)
      for (let e in this.props)
        t.push([+e, this.props[e]]);
    return t;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(t = {}) {
    return this.children.length <= 8 ? this : Os(gt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (e, i, n) => new Q(this.type, e, i, n, this.propValues), t.makeTree || ((e, i, n) => new Q(gt.none, e, i, n)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(t) {
    return nc(t);
  }
}
Q.empty = new Q(gt.none, [], [], 0);
class As {
  constructor(t, e) {
    this.buffer = t, this.index = e;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new As(this.buffer, this.index);
  }
}
class se {
  /**
  Create a tree buffer.
  */
  constructor(t, e, i) {
    this.buffer = t, this.length = e, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return gt.none;
  }
  /**
  @internal
  */
  toString() {
    let t = [];
    for (let e = 0; e < this.buffer.length; )
      t.push(this.childString(e)), e = this.buffer[e + 3];
    return t.join(",");
  }
  /**
  @internal
  */
  childString(t) {
    let e = this.buffer[t], i = this.buffer[t + 3], n = this.set.types[e], r = n.name;
    if (/\W/.test(r) && !n.isError && (r = JSON.stringify(r)), t += 4, i == t)
      return r;
    let o = [];
    for (; t < i; )
      o.push(this.childString(t)), t = this.buffer[t + 3];
    return r + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(t, e, i, n, r) {
    let { buffer: o } = this, l = -1;
    for (let a = t; a != e && !(jl(r, n, o[a + 1], o[a + 2]) && (l = a, i > 0)); a = o[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(t, e, i) {
    let n = this.buffer, r = new Uint16Array(e - t), o = 0;
    for (let l = t, a = 0; l < e; ) {
      r[a++] = n[l++], r[a++] = n[l++] - i;
      let h = r[a++] = n[l++] - i;
      r[a++] = n[l++] - t, o = Math.max(o, h);
    }
    return new se(r, o, this.set);
  }
}
function jl(s, t, e, i) {
  switch (s) {
    case -2:
      return e < t;
    case -1:
      return i >= t && e < t;
    case 0:
      return e < t && i > t;
    case 1:
      return e <= t && i > t;
    case 2:
      return i > t;
    case 4:
      return !0;
  }
}
function Ze(s, t, e, i) {
  for (var n; s.from == s.to || (e < 1 ? s.from >= t : s.from > t) || (e > -1 ? s.to <= t : s.to < t); ) {
    let o = !i && s instanceof at && s.index < 0 ? null : s.parent;
    if (!o)
      return s;
    s = o;
  }
  let r = i ? 0 : G.IgnoreOverlays;
  if (i)
    for (let o = s, l = o.parent; l; o = l, l = o.parent)
      o instanceof at && o.index < 0 && ((n = l.enter(t, e, r)) === null || n === void 0 ? void 0 : n.from) != o.from && (s = l);
  for (; ; ) {
    let o = s.enter(t, e, r);
    if (!o)
      return s;
    s = o;
  }
}
class Kl {
  cursor(t = 0) {
    return new $i(this, t);
  }
  getChild(t, e = null, i = null) {
    let n = qr(this, t, e, i);
    return n.length ? n[0] : null;
  }
  getChildren(t, e = null, i = null) {
    return qr(this, t, e, i);
  }
  resolve(t, e = 0) {
    return Ze(this, t, e, !1);
  }
  resolveInner(t, e = 0) {
    return Ze(this, t, e, !0);
  }
  matchContext(t) {
    return rs(this.parent, t);
  }
  enterUnfinishedNodesBefore(t) {
    let e = this.childBefore(t), i = this;
    for (; e; ) {
      let n = e.lastChild;
      if (!n || n.to != e.to)
        break;
      n.type.isError && n.from == n.to ? (i = e, e = n.prevSibling) : e = n;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class at extends Kl {
  constructor(t, e, i, n) {
    super(), this._tree = t, this.from = e, this.index = i, this._parent = n;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(t, e, i, n, r = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: a } = o._tree, h = e > 0 ? l.length : -1; t != h; t += e) {
        let f = l[t], c = a[t] + o.from;
        if (jl(n, i, c, c + f.length)) {
          if (f instanceof se) {
            if (r & G.ExcludeBuffers)
              continue;
            let u = f.findChild(0, f.buffer.length, e, i - c, n);
            if (u > -1)
              return new Wt(new tc(o, f, t, c), null, u);
          } else if (r & G.IncludeAnonymous || !f.type.isAnonymous || Ms(f)) {
            let u;
            if (!(r & G.IgnoreMounts) && (u = Qe.get(f)) && !u.overlay)
              return new at(u.tree, c, t, o);
            let d = new at(f, c, t, o);
            return r & G.IncludeAnonymous || !d.type.isAnonymous ? d : d.nextChild(e < 0 ? f.children.length - 1 : 0, e, i, n);
          }
        }
      }
      if (r & G.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? t = o.index + e : t = e < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(t) {
    return this.nextChild(
      0,
      1,
      t,
      2
      /* Side.After */
    );
  }
  childBefore(t) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  enter(t, e, i = 0) {
    let n;
    if (!(i & G.IgnoreOverlays) && (n = Qe.get(this._tree)) && n.overlay) {
      let r = t - this.from;
      for (let { from: o, to: l } of n.overlay)
        if ((e > 0 ? o <= r : o < r) && (e < 0 ? l >= r : l > r))
          return new at(n.tree, n.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, t, e, i);
  }
  nextSignificantParent() {
    let t = this;
    for (; t.type.isAnonymous && t._parent; )
      t = t._parent;
    return t;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function qr(s, t, e, i) {
  let n = s.cursor(), r = [];
  if (!n.firstChild())
    return r;
  if (e != null) {
    for (let o = !1; !o; )
      if (o = n.type.is(e), !n.nextSibling())
        return r;
  }
  for (; ; ) {
    if (i != null && n.type.is(i))
      return r;
    if (n.type.is(t) && r.push(n.node), !n.nextSibling())
      return i == null ? r : [];
  }
}
function rs(s, t, e = t.length - 1) {
  for (let i = s; e >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (t[e] && t[e] != i.name)
        return !1;
      e--;
    }
  }
  return !0;
}
class tc {
  constructor(t, e, i, n) {
    this.parent = t, this.buffer = e, this.index = i, this.start = n;
  }
}
class Wt extends Kl {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(t, e, i) {
    super(), this.context = t, this._parent = e, this.index = i, this.type = t.buffer.set.types[t.buffer.buffer[i]];
  }
  child(t, e, i) {
    let { buffer: n } = this.context, r = n.findChild(this.index + 4, n.buffer[this.index + 3], t, e - this.context.start, i);
    return r < 0 ? null : new Wt(this.context, this, r);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(t) {
    return this.child(
      1,
      t,
      2
      /* Side.After */
    );
  }
  childBefore(t) {
    return this.child(
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  enter(t, e, i = 0) {
    if (i & G.ExcludeBuffers)
      return null;
    let { buffer: n } = this.context, r = n.findChild(this.index + 4, n.buffer[this.index + 3], e > 0 ? 1 : -1, t - this.context.start, e);
    return r < 0 ? null : new Wt(this.context, this, r);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(t) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + t,
      t,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: t } = this.context, e = t.buffer[this.index + 3];
    return e < (this._parent ? t.buffer[this._parent.index + 3] : t.buffer.length) ? new Wt(this.context, this._parent, e) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: t } = this.context, e = this._parent ? this._parent.index + 4 : 0;
    return this.index == e ? this.externalSibling(-1) : new Wt(this.context, this._parent, t.findChild(
      e,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let t = [], e = [], { buffer: i } = this.context, n = this.index + 4, r = i.buffer[this.index + 3];
    if (r > n) {
      let o = i.buffer[this.index + 1];
      t.push(i.slice(n, r, o)), e.push(0);
    }
    return new Q(this.type, t, e, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function $l(s) {
  if (!s.length)
    return null;
  let t = 0, e = s[0];
  for (let r = 1; r < s.length; r++) {
    let o = s[r];
    (o.from > e.from || o.to < e.to) && (e = o, t = r);
  }
  let i = e instanceof at && e.index < 0 ? null : e.parent, n = s.slice();
  return i ? n[t] = i : n.splice(t, 1), new ec(n, e);
}
class ec {
  constructor(t, e) {
    this.heads = t, this.node = e;
  }
  get next() {
    return $l(this.heads);
  }
}
function ic(s, t, e) {
  let i = s.resolveInner(t, e), n = null;
  for (let r = i instanceof at ? i : i.context.parent; r; r = r.parent)
    if (r.index < 0) {
      let o = r.parent;
      (n || (n = [i])).push(o.resolve(t, e)), r = o;
    } else {
      let o = Qe.get(r.tree);
      if (o && o.overlay && o.overlay[0].from <= t && o.overlay[o.overlay.length - 1].to >= t) {
        let l = new at(o.tree, o.overlay[0].from + r.from, -1, r);
        (n || (n = [i])).push(Ze(l, t, e, !1));
      }
    }
  return n ? $l(n) : i;
}
class $i {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(t, e = 0) {
    if (this.mode = e, this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, t instanceof at)
      this.yieldNode(t);
    else {
      this._tree = t.context.parent, this.buffer = t.context;
      for (let i = t._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = t, this.yieldBuf(t.index);
    }
  }
  yieldNode(t) {
    return t ? (this._tree = t, this.type = t.type, this.from = t.from, this.to = t.to, !0) : !1;
  }
  yieldBuf(t, e) {
    this.index = t;
    let { start: i, buffer: n } = this.buffer;
    return this.type = e || n.set.types[n.buffer[t]], this.from = i + n.buffer[t + 1], this.to = i + n.buffer[t + 2], !0;
  }
  /**
  @internal
  */
  yield(t) {
    return t ? t instanceof at ? (this.buffer = null, this.yieldNode(t)) : (this.buffer = t.context, this.yieldBuf(t.index, t.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(t, e, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(t < 0 ? this._tree._tree.children.length - 1 : 0, t, e, i, this.mode));
    let { buffer: n } = this.buffer, r = n.findChild(this.index + 4, n.buffer[this.index + 3], t, e - this.buffer.start, i);
    return r < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(r));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(t) {
    return this.enterChild(
      1,
      t,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(t) {
    return this.enterChild(
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(t, e, i = this.mode) {
    return this.buffer ? i & G.ExcludeBuffers ? !1 : this.enterChild(1, t, e) : this.yield(this._tree.enter(t, e, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & G.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let t = this.mode & G.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(t);
  }
  /**
  @internal
  */
  sibling(t) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + t, t, 0, 4, this.mode)) : !1;
    let { buffer: e } = this.buffer, i = this.stack.length - 1;
    if (t < 0) {
      let n = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != n)
        return this.yieldBuf(e.findChild(
          n,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let n = e.buffer[this.index + 3];
      if (n < (i < 0 ? e.buffer.length : e.buffer[this.stack[i] + 3]))
        return this.yieldBuf(n);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + t, t, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(t) {
    let e, i, { buffer: n } = this;
    if (n) {
      if (t > 0) {
        if (this.index < n.buffer.buffer.length)
          return !1;
      } else
        for (let r = 0; r < this.index; r++)
          if (n.buffer.buffer[r + 3] < this.index)
            return !1;
      ({ index: e, parent: i } = n);
    } else
      ({ index: e, _parent: i } = this._tree);
    for (; i; { index: e, _parent: i } = i)
      if (e > -1)
        for (let r = e + t, o = t < 0 ? -1 : i._tree.children.length; r != o; r += t) {
          let l = i._tree.children[r];
          if (this.mode & G.IncludeAnonymous || l instanceof se || !l.type.isAnonymous || Ms(l))
            return !1;
        }
    return !0;
  }
  move(t, e) {
    if (e && this.enterChild(
      t,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(t))
        return !0;
      if (this.atLastNode(t) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(t = !0) {
    return this.move(1, t);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(t = !0) {
    return this.move(-1, t);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(t, e = 0) {
    for (; (this.from == this.to || (e < 1 ? this.from >= t : this.from > t) || (e > -1 ? this.to <= t : this.to < t)) && this.parent(); )
      ;
    for (; this.enterChild(1, t, e); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let t = this.bufferNode, e = null, i = 0;
    if (t && t.context == this.buffer)
      t: for (let n = this.index, r = this.stack.length; r >= 0; ) {
        for (let o = t; o; o = o._parent)
          if (o.index == n) {
            if (n == this.index)
              return o;
            e = o, i = r + 1;
            break t;
          }
        n = this.stack[--r];
      }
    for (let n = i; n < this.stack.length; n++)
      e = new Wt(this.buffer, e, this.stack[n]);
    return this.bufferNode = new Wt(this.buffer, e, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(t, e) {
    for (let i = 0; ; ) {
      let n = !1;
      if (this.type.isAnonymous || t(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (n = !0);
      }
      for (; ; ) {
        if (n && e && e(this), n = this.type.isAnonymous, !i)
          return;
        if (this.nextSibling())
          break;
        this.parent(), i--, n = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(t) {
    if (!this.buffer)
      return rs(this.node.parent, t);
    let { buffer: e } = this.buffer, { types: i } = e.set;
    for (let n = t.length - 1, r = this.stack.length - 1; n >= 0; r--) {
      if (r < 0)
        return rs(this._tree, t, n);
      let o = i[e.buffer[this.stack[r]]];
      if (!o.isAnonymous) {
        if (t[n] && t[n] != o.name)
          return !1;
        n--;
      }
    }
    return !0;
  }
}
function Ms(s) {
  return s.children.some((t) => t instanceof se || !t.type.isAnonymous || Ms(t));
}
function nc(s) {
  var t;
  let { buffer: e, nodeSet: i, maxBufferLength: n = Xf, reused: r = [], minRepeatType: o = i.types.length } = s, l = Array.isArray(e) ? new As(e, e.length) : e, a = i.types, h = 0, f = 0;
  function c(b, A, C, N, R, q) {
    let { id: B, start: T, end: z, size: H } = l, K = f, ht = h;
    for (; H < 0; )
      if (l.next(), H == -1) {
        let qt = r[B];
        C.push(qt), N.push(T - b);
        return;
      } else if (H == -3) {
        h = B;
        return;
      } else if (H == -4) {
        f = B;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${H}`);
    let bt = a[B], Pt, et, kt = T - b;
    if (z - T <= n && (et = m(l.pos - A, R))) {
      let qt = new Uint16Array(et.size - et.skip), St = l.pos - et.size, Bt = qt.length;
      for (; l.pos > St; )
        Bt = y(et.start, qt, Bt);
      Pt = new se(qt, z - et.start, i), kt = et.start - b;
    } else {
      let qt = l.pos - H;
      l.next();
      let St = [], Bt = [], le = B >= o ? B : -1, be = 0, ai = z;
      for (; l.pos > qt; )
        le >= 0 && l.id == le && l.size >= 0 ? (l.end <= ai - n && (p(St, Bt, T, be, l.end, ai, le, K, ht), be = St.length, ai = l.end), l.next()) : q > 2500 ? u(T, qt, St, Bt) : c(T, qt, St, Bt, le, q + 1);
      if (le >= 0 && be > 0 && be < St.length && p(St, Bt, T, be, T, ai, le, K, ht), St.reverse(), Bt.reverse(), le > -1 && be > 0) {
        let Is = d(bt, ht);
        Pt = Os(bt, St, Bt, 0, St.length, 0, z - T, Is, Is);
      } else
        Pt = g(bt, St, Bt, z - T, K - z, ht);
    }
    C.push(Pt), N.push(kt);
  }
  function u(b, A, C, N) {
    let R = [], q = 0, B = -1;
    for (; l.pos > A; ) {
      let { id: T, start: z, end: H, size: K } = l;
      if (K > 4)
        l.next();
      else {
        if (B > -1 && z < B)
          break;
        B < 0 && (B = H - n), R.push(T, z, H), q++, l.next();
      }
    }
    if (q) {
      let T = new Uint16Array(q * 4), z = R[R.length - 2];
      for (let H = R.length - 3, K = 0; H >= 0; H -= 3)
        T[K++] = R[H], T[K++] = R[H + 1] - z, T[K++] = R[H + 2] - z, T[K++] = K;
      C.push(new se(T, R[2] - z, i)), N.push(z - b);
    }
  }
  function d(b, A) {
    return (C, N, R) => {
      let q = 0, B = C.length - 1, T, z;
      if (B >= 0 && (T = C[B]) instanceof Q) {
        if (!B && T.type == b && T.length == R)
          return T;
        (z = T.prop(E.lookAhead)) && (q = N[B] + T.length + z);
      }
      return g(b, C, N, R, q, A);
    };
  }
  function p(b, A, C, N, R, q, B, T, z) {
    let H = [], K = [];
    for (; b.length > N; )
      H.push(b.pop()), K.push(A.pop() + C - R);
    b.push(g(i.types[B], H, K, q - R, T - q, z)), A.push(R - C);
  }
  function g(b, A, C, N, R, q, B) {
    if (q) {
      let T = [E.contextHash, q];
      B = B ? [T].concat(B) : [T];
    }
    if (R > 25) {
      let T = [E.lookAhead, R];
      B = B ? [T].concat(B) : [T];
    }
    return new Q(b, A, C, N, B);
  }
  function m(b, A) {
    let C = l.fork(), N = 0, R = 0, q = 0, B = C.end - n, T = { size: 0, start: 0, skip: 0 };
    t: for (let z = C.pos - b; C.pos > z; ) {
      let H = C.size;
      if (C.id == A && H >= 0) {
        T.size = N, T.start = R, T.skip = q, q += 4, N += 4, C.next();
        continue;
      }
      let K = C.pos - H;
      if (H < 0 || K < z || C.start < B)
        break;
      let ht = C.id >= o ? 4 : 0, bt = C.start;
      for (C.next(); C.pos > K; ) {
        if (C.size < 0)
          if (C.size == -3)
            ht += 4;
          else
            break t;
        else C.id >= o && (ht += 4);
        C.next();
      }
      R = bt, N += H, q += ht;
    }
    return (A < 0 || N == b) && (T.size = N, T.start = R, T.skip = q), T.size > 4 ? T : void 0;
  }
  function y(b, A, C) {
    let { id: N, start: R, end: q, size: B } = l;
    if (l.next(), B >= 0 && N < o) {
      let T = C;
      if (B > 4) {
        let z = l.pos - (B - 4);
        for (; l.pos > z; )
          C = y(b, A, C);
      }
      A[--C] = T, A[--C] = q - b, A[--C] = R - b, A[--C] = N;
    } else B == -3 ? h = N : B == -4 && (f = N);
    return C;
  }
  let w = [], M = [];
  for (; l.pos > 0; )
    c(s.start || 0, s.bufferStart || 0, w, M, -1, 0);
  let S = (t = s.length) !== null && t !== void 0 ? t : w.length ? M[0] + w[0].length : 0;
  return new Q(a[s.topID], w.reverse(), M.reverse(), S);
}
const jr = /* @__PURE__ */ new WeakMap();
function Ii(s, t) {
  if (!s.isAnonymous || t instanceof se || t.type != s)
    return 1;
  let e = jr.get(t);
  if (e == null) {
    e = 1;
    for (let i of t.children) {
      if (i.type != s || !(i instanceof Q)) {
        e = 1;
        break;
      }
      e += Ii(s, i);
    }
    jr.set(t, e);
  }
  return e;
}
function Os(s, t, e, i, n, r, o, l, a) {
  let h = 0;
  for (let p = i; p < n; p++)
    h += Ii(s, t[p]);
  let f = Math.ceil(
    h * 1.5 / 8
    /* Balance.BranchFactor */
  ), c = [], u = [];
  function d(p, g, m, y, w) {
    for (let M = m; M < y; ) {
      let S = M, b = g[M], A = Ii(s, p[M]);
      for (M++; M < y; M++) {
        let C = Ii(s, p[M]);
        if (A + C >= f)
          break;
        A += C;
      }
      if (M == S + 1) {
        if (A > f) {
          let C = p[S];
          d(C.children, C.positions, 0, C.children.length, g[S] + w);
          continue;
        }
        c.push(p[S]);
      } else {
        let C = g[M - 1] + p[M - 1].length - b;
        c.push(Os(s, p, g, S, M, b, C, null, a));
      }
      u.push(b + w - r);
    }
  }
  return d(t, e, i, n, 0), (l || a)(c, u, o);
}
class dd {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(t, e, i) {
    let n = this.map.get(t);
    n || this.map.set(t, n = /* @__PURE__ */ new Map()), n.set(e, i);
  }
  getBuffer(t, e) {
    let i = this.map.get(t);
    return i && i.get(e);
  }
  /**
  Set the value for this syntax node.
  */
  set(t, e) {
    t instanceof Wt ? this.setBuffer(t.context.buffer, t.index, e) : t instanceof at && this.map.set(t.tree, e);
  }
  /**
  Retrieve value for this syntax node, if it exists in the map.
  */
  get(t) {
    return t instanceof Wt ? this.getBuffer(t.context.buffer, t.index) : t instanceof at ? this.map.get(t.tree) : void 0;
  }
  /**
  Set the value for the node that a cursor currently points to.
  */
  cursorSet(t, e) {
    t.buffer ? this.setBuffer(t.buffer.buffer, t.index, e) : this.map.set(t.tree, e);
  }
  /**
  Retrieve the value for the node that a cursor currently points
  to.
  */
  cursorGet(t) {
    return t.buffer ? this.getBuffer(t.buffer.buffer, t.index) : this.map.get(t.tree);
  }
}
class Kt {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(t, e, i, n, r = !1, o = !1) {
    this.from = t, this.to = e, this.tree = i, this.offset = n, this.open = (r ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(t, e = [], i = !1) {
    let n = [new Kt(0, t.length, t, 0, !1, i)];
    for (let r of e)
      r.to > t.length && n.push(r);
    return n;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(t, e, i = 128) {
    if (!e.length)
      return t;
    let n = [], r = 1, o = t.length ? t[0] : null;
    for (let l = 0, a = 0, h = 0; ; l++) {
      let f = l < e.length ? e[l] : null, c = f ? f.fromA : 1e9;
      if (c - a >= i)
        for (; o && o.from < c; ) {
          let u = o;
          if (a >= u.from || c <= u.to || h) {
            let d = Math.max(u.from, a) - h, p = Math.min(u.to, c) - h;
            u = d >= p ? null : new Kt(d, p, u.tree, u.offset + h, l > 0, !!f);
          }
          if (u && n.push(u), o.to > c)
            break;
          o = r < t.length ? t[r++] : null;
        }
      if (!f)
        break;
      a = f.toA, h = f.toA - f.toB;
    }
    return n;
  }
}
class sc {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(t, e, i) {
    return typeof t == "string" && (t = new rc(t)), i = i ? i.length ? i.map((n) => new At(n.from, n.to)) : [new At(0, 0)] : [new At(0, t.length)], this.createParse(t, e || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(t, e, i) {
    let n = this.startParse(t, e, i);
    for (; ; ) {
      let r = n.advance();
      if (r)
        return r;
    }
  }
}
class rc {
  constructor(t) {
    this.string = t;
  }
  get length() {
    return this.string.length;
  }
  chunk(t) {
    return this.string.slice(t);
  }
  get lineChunks() {
    return !1;
  }
  read(t, e) {
    return this.string.slice(t, e);
  }
}
function pd(s) {
  return (t, e, i, n) => new lc(t, s, e, i, n);
}
class Kr {
  constructor(t, e, i, n, r) {
    this.parser = t, this.parse = e, this.overlay = i, this.target = n, this.from = r;
  }
}
function $r(s) {
  if (!s.length || s.some((t) => t.from >= t.to))
    throw new RangeError("Invalid inner parse ranges given: " + JSON.stringify(s));
}
class oc {
  constructor(t, e, i, n, r, o, l) {
    this.parser = t, this.predicate = e, this.mounts = i, this.index = n, this.start = r, this.target = o, this.prev = l, this.depth = 0, this.ranges = [];
  }
}
const os = new E({ perNode: !0 });
class lc {
  constructor(t, e, i, n, r) {
    this.nest = e, this.input = i, this.fragments = n, this.ranges = r, this.inner = [], this.innerDone = 0, this.baseTree = null, this.stoppedAt = null, this.baseParse = t;
  }
  advance() {
    if (this.baseParse) {
      let i = this.baseParse.advance();
      if (!i)
        return null;
      if (this.baseParse = null, this.baseTree = i, this.startInner(), this.stoppedAt != null)
        for (let n of this.inner)
          n.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let i = this.baseTree;
      return this.stoppedAt != null && (i = new Q(i.type, i.children, i.positions, i.length, i.propValues.concat([[os, this.stoppedAt]]))), i;
    }
    let t = this.inner[this.innerDone], e = t.parse.advance();
    if (e) {
      this.innerDone++;
      let i = Object.assign(/* @__PURE__ */ Object.create(null), t.target.props);
      i[E.mounted.id] = new Qe(e, t.overlay, t.parser), t.target.props = i;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let t = this.input.length;
    for (let e = this.innerDone; e < this.inner.length; e++)
      this.inner[e].from < t && (t = Math.min(t, this.inner[e].parse.parsedPos));
    return t;
  }
  stopAt(t) {
    if (this.stoppedAt = t, this.baseParse)
      this.baseParse.stopAt(t);
    else
      for (let e = this.innerDone; e < this.inner.length; e++)
        this.inner[e].parse.stopAt(t);
  }
  startInner() {
    let t = new fc(this.fragments), e = null, i = null, n = new $i(new at(this.baseTree, this.ranges[0].from, 0, null), G.IncludeAnonymous | G.IgnoreMounts);
    t: for (let r, o; ; ) {
      let l = !0, a;
      if (this.stoppedAt != null && n.from >= this.stoppedAt)
        l = !1;
      else if (t.hasNode(n)) {
        if (e) {
          let h = e.mounts.find((f) => f.frag.from <= n.from && f.frag.to >= n.to && f.mount.overlay);
          if (h)
            for (let f of h.mount.overlay) {
              let c = f.from + h.pos, u = f.to + h.pos;
              c >= n.from && u <= n.to && !e.ranges.some((d) => d.from < u && d.to > c) && e.ranges.push({ from: c, to: u });
            }
        }
        l = !1;
      } else if (i && (o = ac(i.ranges, n.from, n.to)))
        l = o != 2;
      else if (!n.type.isAnonymous && (r = this.nest(n, this.input)) && (n.from < n.to || !r.overlay)) {
        n.tree || hc(n);
        let h = t.findMounts(n.from, r.parser);
        if (typeof r.overlay == "function")
          e = new oc(r.parser, r.overlay, h, this.inner.length, n.from, n.tree, e);
        else {
          let f = _r(this.ranges, r.overlay || (n.from < n.to ? [new At(n.from, n.to)] : []));
          f.length && $r(f), (f.length || !r.overlay) && this.inner.push(new Kr(r.parser, f.length ? r.parser.startParse(this.input, Jr(h, f), f) : r.parser.startParse(""), r.overlay ? r.overlay.map((c) => new At(c.from - n.from, c.to - n.from)) : null, n.tree, f.length ? f[0].from : n.from)), r.overlay ? f.length && (i = { ranges: f, depth: 0, prev: i }) : l = !1;
        }
      } else if (e && (a = e.predicate(n)) && (a === !0 && (a = new At(n.from, n.to)), a.from < a.to)) {
        let h = e.ranges.length - 1;
        h >= 0 && e.ranges[h].to == a.from ? e.ranges[h] = { from: e.ranges[h].from, to: a.to } : e.ranges.push(a);
      }
      if (l && n.firstChild())
        e && e.depth++, i && i.depth++;
      else
        for (; !n.nextSibling(); ) {
          if (!n.parent())
            break t;
          if (e && !--e.depth) {
            let h = _r(this.ranges, e.ranges);
            h.length && ($r(h), this.inner.splice(e.index, 0, new Kr(e.parser, e.parser.startParse(this.input, Jr(e.mounts, h), h), e.ranges.map((f) => new At(f.from - e.start, f.to - e.start)), e.target, h[0].from))), e = e.prev;
          }
          i && !--i.depth && (i = i.prev);
        }
    }
  }
}
function ac(s, t, e) {
  for (let i of s) {
    if (i.from >= e)
      break;
    if (i.to > t)
      return i.from <= t && i.to >= e ? 2 : 1;
  }
  return 0;
}
function Ur(s, t, e, i, n, r) {
  if (t < e) {
    let o = s.buffer[t + 1];
    i.push(s.slice(t, e, o)), n.push(o - r);
  }
}
function hc(s) {
  let { node: t } = s, e = [], i = t.context.buffer;
  do
    e.push(s.index), s.parent();
  while (!s.tree);
  let n = s.tree, r = n.children.indexOf(i), o = n.children[r], l = o.buffer, a = [r];
  function h(f, c, u, d, p, g) {
    let m = e[g], y = [], w = [];
    Ur(o, f, m, y, w, d);
    let M = l[m + 1], S = l[m + 2];
    a.push(y.length);
    let b = g ? h(m + 4, l[m + 3], o.set.types[l[m]], M, S - M, g - 1) : t.toTree();
    return y.push(b), w.push(M - d), Ur(o, l[m + 3], c, y, w, d), new Q(u, y, w, p);
  }
  n.children[r] = h(0, l.length, gt.none, 0, o.length, e.length - 1);
  for (let f of a) {
    let c = s.tree.children[f], u = s.tree.positions[f];
    s.yield(new at(c, u + s.from, f, s._tree));
  }
}
class Gr {
  constructor(t, e) {
    this.offset = e, this.done = !1, this.cursor = t.cursor(G.IncludeAnonymous | G.IgnoreMounts);
  }
  // Move to the first node (in pre-order) that starts at or after `pos`.
  moveTo(t) {
    let { cursor: e } = this, i = t - this.offset;
    for (; !this.done && e.from < i; )
      e.to >= t && e.enter(i, 1, G.IgnoreOverlays | G.ExcludeBuffers) || e.next(!1) || (this.done = !0);
  }
  hasNode(t) {
    if (this.moveTo(t.from), !this.done && this.cursor.from + this.offset == t.from && this.cursor.tree)
      for (let e = this.cursor.tree; ; ) {
        if (e == t.tree)
          return !0;
        if (e.children.length && e.positions[0] == 0 && e.children[0] instanceof Q)
          e = e.children[0];
        else
          break;
      }
    return !1;
  }
}
class fc {
  constructor(t) {
    var e;
    if (this.fragments = t, this.curTo = 0, this.fragI = 0, t.length) {
      let i = this.curFrag = t[0];
      this.curTo = (e = i.tree.prop(os)) !== null && e !== void 0 ? e : i.to, this.inner = new Gr(i.tree, -i.offset);
    } else
      this.curFrag = this.inner = null;
  }
  hasNode(t) {
    for (; this.curFrag && t.from >= this.curTo; )
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= t.from && this.curTo >= t.to && this.inner.hasNode(t);
  }
  nextFrag() {
    var t;
    if (this.fragI++, this.fragI == this.fragments.length)
      this.curFrag = this.inner = null;
    else {
      let e = this.curFrag = this.fragments[this.fragI];
      this.curTo = (t = e.tree.prop(os)) !== null && t !== void 0 ? t : e.to, this.inner = new Gr(e.tree, -e.offset);
    }
  }
  findMounts(t, e) {
    var i;
    let n = [];
    if (this.inner) {
      this.inner.cursor.moveTo(t, 1);
      for (let r = this.inner.cursor.node; r; r = r.parent) {
        let o = (i = r.tree) === null || i === void 0 ? void 0 : i.prop(E.mounted);
        if (o && o.parser == e)
          for (let l = this.fragI; l < this.fragments.length; l++) {
            let a = this.fragments[l];
            if (a.from >= r.to)
              break;
            a.tree == this.curFrag.tree && n.push({
              frag: a,
              pos: r.from - a.offset,
              mount: o
            });
          }
      }
    }
    return n;
  }
}
function _r(s, t) {
  let e = null, i = t;
  for (let n = 1, r = 0; n < s.length; n++) {
    let o = s[n - 1].to, l = s[n].from;
    for (; r < i.length; r++) {
      let a = i[r];
      if (a.from >= l)
        break;
      a.to <= o || (e || (i = e = t.slice()), a.from < o ? (e[r] = new At(a.from, o), a.to > l && e.splice(r + 1, 0, new At(l, a.to))) : a.to > l ? e[r--] = new At(l, a.to) : e.splice(r--, 1));
    }
  }
  return i;
}
function cc(s, t, e, i) {
  let n = 0, r = 0, o = !1, l = !1, a = -1e9, h = [];
  for (; ; ) {
    let f = n == s.length ? 1e9 : o ? s[n].to : s[n].from, c = r == t.length ? 1e9 : l ? t[r].to : t[r].from;
    if (o != l) {
      let u = Math.max(a, e), d = Math.min(f, c, i);
      u < d && h.push(new At(u, d));
    }
    if (a = Math.min(f, c), a == 1e9)
      break;
    f == a && (o ? (o = !1, n++) : o = !0), c == a && (l ? (l = !1, r++) : l = !0);
  }
  return h;
}
function Jr(s, t) {
  let e = [];
  for (let { pos: i, mount: n, frag: r } of s) {
    let o = i + (n.overlay ? n.overlay[0].from : 0), l = o + n.tree.length, a = Math.max(r.from, o), h = Math.min(r.to, l);
    if (n.overlay) {
      let f = n.overlay.map((u) => new At(u.from + i, u.to + i)), c = cc(t, f, a, h);
      for (let u = 0, d = a; ; u++) {
        let p = u == c.length, g = p ? h : c[u].from;
        if (g > d && e.push(new Kt(d, g, n.tree, -o, r.from >= d || r.openStart, r.to <= g || r.openEnd)), p)
          break;
        d = c[u].to;
      }
    } else
      e.push(new Kt(a, h, n.tree, -o, r.from >= o || r.openStart, r.to <= l || r.openEnd));
  }
  return e;
}
let uc = 0;
class Nt {
  /**
  @internal
  */
  constructor(t, e, i) {
    this.set = t, this.base = e, this.modified = i, this.id = uc++;
  }
  /**
  Define a new tag. If `parent` is given, the tag is treated as a
  sub-tag of that parent, and
  [highlighters](#highlight.tagHighlighter) that don't mention
  this tag will try to fall back to the parent tag (or grandparent
  tag, etc).
  */
  static define(t) {
    if (t != null && t.base)
      throw new Error("Can not derive from a modified tag");
    let e = new Nt([], null, []);
    if (e.set.push(e), t)
      for (let i of t.set)
        e.set.push(i);
    return e;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier() {
    let t = new Ui();
    return (e) => e.modified.indexOf(t) > -1 ? e : Ui.get(e.base || e, e.modified.concat(t).sort((i, n) => i.id - n.id));
  }
}
let dc = 0;
class Ui {
  constructor() {
    this.instances = [], this.id = dc++;
  }
  static get(t, e) {
    if (!e.length)
      return t;
    let i = e[0].instances.find((l) => l.base == t && pc(e, l.modified));
    if (i)
      return i;
    let n = [], r = new Nt(n, t, e);
    for (let l of e)
      l.instances.push(r);
    let o = gc(e);
    for (let l of t.set)
      if (!l.modified.length)
        for (let a of o)
          n.push(Ui.get(l, a));
    return r;
  }
}
function pc(s, t) {
  return s.length == t.length && s.every((e, i) => e == t[i]);
}
function gc(s) {
  let t = [[]];
  for (let e = 0; e < s.length; e++)
    for (let i = 0, n = t.length; i < n; i++)
      t.push(t[i].concat(s[e]));
  return t.sort((e, i) => i.length - e.length);
}
function mc(s) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e in s) {
    let i = s[e];
    Array.isArray(i) || (i = [i]);
    for (let n of e.split(" "))
      if (n) {
        let r = [], o = 2, l = n;
        for (let c = 0; ; ) {
          if (l == "..." && c > 0 && c + 3 == n.length) {
            o = 1;
            break;
          }
          let u = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!u)
            throw new RangeError("Invalid path: " + n);
          if (r.push(u[0] == "*" ? "" : u[0][0] == '"' ? JSON.parse(u[0]) : u[0]), c += u[0].length, c == n.length)
            break;
          let d = n[c++];
          if (c == n.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + n);
          l = n.slice(c);
        }
        let a = r.length - 1, h = r[a];
        if (!h)
          throw new RangeError("Invalid path: " + n);
        let f = new Gi(i, o, a > 0 ? r.slice(0, a) : null);
        t[h] = f.sort(t[h]);
      }
  }
  return Ul.add(t);
}
const Ul = new E();
class Gi {
  constructor(t, e, i, n) {
    this.tags = t, this.mode = e, this.context = i, this.next = n;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(t) {
    return !t || t.depth < this.depth ? (this.next = t, this) : (t.next = this.sort(t.next), t);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
Gi.empty = new Gi([], 2, null);
function Gl(s, t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let r of s)
    if (!Array.isArray(r.tag))
      e[r.tag.id] = r.class;
    else
      for (let o of r.tag)
        e[o.id] = r.class;
  let { scope: i, all: n = null } = t || {};
  return {
    style: (r) => {
      let o = n;
      for (let l of r)
        for (let a of l.set) {
          let h = e[a.id];
          if (h) {
            o = o ? o + " " + h : h;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
function yc(s, t) {
  let e = null;
  for (let i of s) {
    let n = i.style(t);
    n && (e = e ? e + " " + n : n);
  }
  return e;
}
function bc(s, t, e, i = 0, n = s.length) {
  let r = new wc(i, Array.isArray(t) ? t : [t], e);
  r.highlightRange(s.cursor(), i, n, "", r.highlighters), r.flush(n);
}
class wc {
  constructor(t, e, i) {
    this.at = t, this.highlighters = e, this.span = i, this.class = "";
  }
  startSpan(t, e) {
    e != this.class && (this.flush(t), t > this.at && (this.at = t), this.class = e);
  }
  flush(t) {
    t > this.at && this.class && this.span(this.at, t, this.class);
  }
  highlightRange(t, e, i, n, r) {
    let { type: o, from: l, to: a } = t;
    if (l >= i || a <= e)
      return;
    o.isTop && (r = this.highlighters.filter((d) => !d.scope || d.scope(o)));
    let h = n, f = xc(t) || Gi.empty, c = yc(r, f.tags);
    if (c && (h && (h += " "), h += c, f.mode == 1 && (n += (n ? " " : "") + c)), this.startSpan(Math.max(e, l), h), f.opaque)
      return;
    let u = t.tree && t.tree.prop(E.mounted);
    if (u && u.overlay) {
      let d = t.node.enter(u.overlay[0].from + l, 1), p = this.highlighters.filter((m) => !m.scope || m.scope(u.tree.type)), g = t.firstChild();
      for (let m = 0, y = l; ; m++) {
        let w = m < u.overlay.length ? u.overlay[m] : null, M = w ? w.from + l : a, S = Math.max(e, y), b = Math.min(i, M);
        if (S < b && g)
          for (; t.from < b && (this.highlightRange(t, S, b, n, r), this.startSpan(Math.min(b, t.to), h), !(t.to >= M || !t.nextSibling())); )
            ;
        if (!w || M > i)
          break;
        y = w.to + l, y > e && (this.highlightRange(d.cursor(), Math.max(e, w.from + l), Math.min(i, y), "", p), this.startSpan(Math.min(i, y), h));
      }
      g && t.parent();
    } else if (t.firstChild()) {
      u && (n = "");
      do
        if (!(t.to <= e)) {
          if (t.from >= i)
            break;
          this.highlightRange(t, e, i, n, r), this.startSpan(Math.min(i, t.to), h);
        }
      while (t.nextSibling());
      t.parent();
    }
  }
}
function xc(s) {
  let t = s.type.prop(Ul);
  for (; t && t.context && !s.matchContext(t.context); )
    t = t.next;
  return t || null;
}
const x = Nt.define, ki = x(), Gt = x(), Yr = x(Gt), Xr = x(Gt), _t = x(), Si = x(_t), bn = x(_t), It = x(), ae = x(It), Et = x(), Lt = x(), ls = x(), Ne = x(ls), Ci = x(), k = {
  /**
  A comment.
  */
  comment: ki,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: x(ki),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: x(ki),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: x(ki),
  /**
  Any kind of identifier.
  */
  name: Gt,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: x(Gt),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: Yr,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: x(Yr),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: Xr,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: x(Xr),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: x(Gt),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: x(Gt),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: x(Gt),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: x(Gt),
  /**
  A literal value.
  */
  literal: _t,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Si,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: x(Si),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: x(Si),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: x(Si),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: bn,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: x(bn),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: x(bn),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: x(_t),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: x(_t),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: x(_t),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: x(_t),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: x(_t),
  /**
  A language keyword.
  */
  keyword: Et,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: x(Et),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: x(Et),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: x(Et),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: x(Et),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: x(Et),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: x(Et),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: x(Et),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: x(Et),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: x(Et),
  /**
  An operator.
  */
  operator: Lt,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: x(Lt),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: x(Lt),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: x(Lt),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: x(Lt),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: x(Lt),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: x(Lt),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: x(Lt),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: x(Lt),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: x(Lt),
  /**
  Program or markup punctuation.
  */
  punctuation: ls,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: x(ls),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Ne,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: x(Ne),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: x(Ne),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: x(Ne),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: x(Ne),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: It,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: ae,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: x(ae),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: x(ae),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: x(ae),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: x(ae),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: x(ae),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: x(ae),
  /**
  A prose separator (such as a horizontal rule).
  */
  contentSeparator: x(It),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: x(It),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: x(It),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: x(It),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: x(It),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: x(It),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: x(It),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: x(It),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: x(),
  /**
  Deleted text.
  */
  deleted: x(),
  /**
  Changed text.
  */
  changed: x(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: x(),
  /**
  Metadata or meta-instruction.
  */
  meta: Ci,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: x(Ci),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: x(Ci),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: x(Ci),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Nt.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Nt.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Nt.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Nt.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Nt.defineModifier(),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Nt.defineModifier()
};
Gl([
  { tag: k.link, class: "tok-link" },
  { tag: k.heading, class: "tok-heading" },
  { tag: k.emphasis, class: "tok-emphasis" },
  { tag: k.strong, class: "tok-strong" },
  { tag: k.keyword, class: "tok-keyword" },
  { tag: k.atom, class: "tok-atom" },
  { tag: k.bool, class: "tok-bool" },
  { tag: k.url, class: "tok-url" },
  { tag: k.labelName, class: "tok-labelName" },
  { tag: k.inserted, class: "tok-inserted" },
  { tag: k.deleted, class: "tok-deleted" },
  { tag: k.literal, class: "tok-literal" },
  { tag: k.string, class: "tok-string" },
  { tag: k.number, class: "tok-number" },
  { tag: [k.regexp, k.escape, k.special(k.string)], class: "tok-string2" },
  { tag: k.variableName, class: "tok-variableName" },
  { tag: k.local(k.variableName), class: "tok-variableName tok-local" },
  { tag: k.definition(k.variableName), class: "tok-variableName tok-definition" },
  { tag: k.special(k.variableName), class: "tok-variableName2" },
  { tag: k.definition(k.propertyName), class: "tok-propertyName tok-definition" },
  { tag: k.typeName, class: "tok-typeName" },
  { tag: k.namespace, class: "tok-namespace" },
  { tag: k.className, class: "tok-className" },
  { tag: k.macroName, class: "tok-macroName" },
  { tag: k.propertyName, class: "tok-propertyName" },
  { tag: k.operator, class: "tok-operator" },
  { tag: k.comment, class: "tok-comment" },
  { tag: k.meta, class: "tok-meta" },
  { tag: k.invalid, class: "tok-invalid" },
  { tag: k.punctuation, class: "tok-punctuation" }
]);
var wn;
const ke = /* @__PURE__ */ new E();
function vc(s) {
  return D.define({
    combine: s ? (t) => t.concat(s) : void 0
  });
}
const kc = /* @__PURE__ */ new E();
class Tt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(t, e, i = [], n = "") {
    this.data = t, this.name = n, F.prototype.hasOwnProperty("tree") || Object.defineProperty(F.prototype, "tree", { get() {
      return mt(this);
    } }), this.parser = e, this.extension = [
      re.of(this),
      F.languageData.of((r, o, l) => {
        let a = Qr(r, o, l), h = a.type.prop(ke);
        if (!h)
          return [];
        let f = r.facet(h), c = a.type.prop(kc);
        if (c) {
          let u = a.resolve(o - a.from, l);
          for (let d of c)
            if (d.test(u, r)) {
              let p = r.facet(d.facet);
              return d.type == "replace" ? p : p.concat(f);
            }
        }
        return f;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(t, e, i = -1) {
    return Qr(t, e, i).type.prop(ke) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(t) {
    let e = t.facet(re);
    if ((e == null ? void 0 : e.data) == this.data)
      return [{ from: 0, to: t.doc.length }];
    if (!e || !e.allowsNesting)
      return [];
    let i = [], n = (r, o) => {
      if (r.prop(ke) == this.data) {
        i.push({ from: o, to: o + r.length });
        return;
      }
      let l = r.prop(E.mounted);
      if (l) {
        if (l.tree.prop(ke) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + o, to: a.to + o });
          else
            i.push({ from: o, to: o + r.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (n(l.tree, l.overlay[0].from + o), i.length > a)
            return;
        }
      }
      for (let a = 0; a < r.children.length; a++) {
        let h = r.children[a];
        h instanceof Q && n(h, r.positions[a] + o);
      }
    };
    return n(mt(t), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
Tt.setState = /* @__PURE__ */ L.define();
function Qr(s, t, e) {
  let i = s.facet(re), n = mt(s).topNode;
  if (!i || i.allowsNesting)
    for (let r = n; r; r = r.enter(t, e, G.ExcludeBuffers))
      r.type.isTop && (n = r);
  return n;
}
class as extends Tt {
  constructor(t, e, i) {
    super(t, e, [], i), this.parser = e;
  }
  /**
  Define a language from a parser.
  */
  static define(t) {
    let e = vc(t.languageData);
    return new as(e, t.parser.configure({
      props: [ke.add((i) => i.isTop ? e : void 0)]
    }), t.name);
  }
  /**
  Create a new instance of this language with a reconfigured
  version of its parser and optionally a new name.
  */
  configure(t, e) {
    return new as(this.data, this.parser.configure(t), e || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function mt(s) {
  let t = s.field(Tt.state, !1);
  return t ? t.tree : Q.empty;
}
class Sc {
  /**
  Create an input object for the given document.
  */
  constructor(t) {
    this.doc = t, this.cursorPos = 0, this.string = "", this.cursor = t.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(t) {
    return this.string = this.cursor.next(t - this.cursorPos).value, this.cursorPos = t + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(t) {
    return this.syncTo(t), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(t, e) {
    let i = this.cursorPos - this.string.length;
    return t < i || e >= this.cursorPos ? this.doc.sliceString(t, e) : this.string.slice(t - i, e - i);
  }
}
let He = null;
class _i {
  constructor(t, e, i = [], n, r, o, l, a) {
    this.parser = t, this.state = e, this.fragments = i, this.tree = n, this.treeLen = r, this.viewport = o, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new _i(t, e, [], Q.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new Sc(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(t, e) {
    return e != null && e >= this.state.doc.length && (e = void 0), this.tree != Q.empty && this.isDone(e ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof t == "number") {
        let n = Date.now() + t;
        t = () => Date.now() > n;
      }
      for (this.parse || (this.parse = this.startParse()), e != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > e) && e < this.state.doc.length && this.parse.stopAt(e); ; ) {
        let n = this.parse.advance();
        if (n)
          if (this.fragments = this.withoutTempSkipped(Kt.addTree(n, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = n, this.parse = null, this.treeLen < (e ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (t())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let t, e;
    this.parse && (t = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > t) && this.parse.stopAt(t), this.withContext(() => {
      for (; !(e = this.parse.advance()); )
        ;
    }), this.treeLen = t, this.tree = e, this.fragments = this.withoutTempSkipped(Kt.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(t) {
    let e = He;
    He = this;
    try {
      return t();
    } finally {
      He = e;
    }
  }
  withoutTempSkipped(t) {
    for (let e; e = this.tempSkipped.pop(); )
      t = Zr(t, e.from, e.to);
    return t;
  }
  /**
  @internal
  */
  changes(t, e) {
    let { fragments: i, tree: n, treeLen: r, viewport: o, skipped: l } = this;
    if (this.takeTree(), !t.empty) {
      let a = [];
      if (t.iterChangedRanges((h, f, c, u) => a.push({ fromA: h, toA: f, fromB: c, toB: u })), i = Kt.applyChanges(i, a), n = Q.empty, r = 0, o = { from: t.mapPos(o.from, -1), to: t.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let h of this.skipped) {
          let f = t.mapPos(h.from, 1), c = t.mapPos(h.to, -1);
          f < c && l.push({ from: f, to: c });
        }
      }
    }
    return new _i(this.parser, e, i, n, r, o, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(t) {
    if (this.viewport.from == t.from && this.viewport.to == t.to)
      return !1;
    this.viewport = t;
    let e = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: n, to: r } = this.skipped[i];
      n < t.to && r > t.from && (this.fragments = Zr(this.fragments, n, r), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= e ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(t, e) {
    this.skipped.push({ from: t, to: e });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(t) {
    return new class extends sc {
      createParse(e, i, n) {
        let r = n[0].from, o = n[n.length - 1].to;
        return {
          parsedPos: r,
          advance() {
            let a = He;
            if (a) {
              for (let h of n)
                a.tempSkipped.push(h);
              t && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, t]) : t);
            }
            return this.parsedPos = o, new Q(gt.none, [], [], o - r);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(t) {
    t = Math.min(t, this.state.doc.length);
    let e = this.fragments;
    return this.treeLen >= t && e.length && e[0].from == 0 && e[0].to >= t;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return He;
  }
}
function Zr(s, t, e) {
  return Kt.applyChanges(s, [{ fromA: t, toA: e, fromB: t, toB: e }]);
}
class Pe {
  constructor(t) {
    this.context = t, this.tree = t.tree;
  }
  apply(t) {
    if (!t.docChanged && this.tree == this.context.tree)
      return this;
    let e = this.context.changes(t.changes, t.state), i = this.context.treeLen == t.startState.doc.length ? void 0 : Math.max(t.changes.mapPos(this.context.treeLen), e.viewport.to);
    return e.work(20, i) || e.takeTree(), new Pe(e);
  }
  static init(t) {
    let e = Math.min(3e3, t.doc.length), i = _i.create(t.facet(re).parser, t, { from: 0, to: e });
    return i.work(20, e) || i.takeTree(), new Pe(i);
  }
}
Tt.state = /* @__PURE__ */ yt.define({
  create: Pe.init,
  update(s, t) {
    for (let e of t.effects)
      if (e.is(Tt.setState))
        return e.value;
    return t.startState.facet(re) != t.state.facet(re) ? Pe.init(t.state) : s.apply(t);
  }
});
let _l = (s) => {
  let t = setTimeout(
    () => s(),
    500
    /* MaxPause */
  );
  return () => clearTimeout(t);
};
typeof requestIdleCallback < "u" && (_l = (s) => {
  let t = -1, e = setTimeout(
    () => {
      t = requestIdleCallback(s, {
        timeout: 400
        /* MinPause */
      });
    },
    100
    /* MinPause */
  );
  return () => t < 0 ? clearTimeout(e) : cancelIdleCallback(t);
});
const xn = typeof navigator < "u" && (!((wn = navigator.scheduling) === null || wn === void 0) && wn.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Cc = /* @__PURE__ */ tt.fromClass(class {
  constructor(t) {
    this.view = t, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(t) {
    let e = this.view.state.field(Tt.state).context;
    (e.updateViewport(t.view.viewport) || this.view.viewport.to > e.treeLen) && this.scheduleWork(), t.docChanged && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(e);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: t } = this.view, e = t.field(Tt.state);
    (e.tree != e.context.tree || !e.context.isDone(t.doc.length)) && (this.working = _l(this.work));
  }
  work(t) {
    this.working = null;
    let e = Date.now();
    if (this.chunkEnd < e && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = e + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: n } } = this.view, r = i.field(Tt.state);
    if (r.tree == r.context.tree && r.context.isDone(
      n + 1e5
      /* MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, t && !xn ? Math.max(25, t.timeRemaining() - 5) : 1e9), l = r.context.treeLen < n && i.doc.length > n + 1e3, a = r.context.work(() => xn && xn() || Date.now() > o, n + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - e, (a || this.chunkBudget <= 0) && (r.context.takeTree(), this.view.dispatch({ effects: Tt.setState.of(new Pe(r.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(r.context);
  }
  checkAsyncSchedule(t) {
    t.scheduleOn && (this.workScheduled++, t.scheduleOn.then(() => this.scheduleWork()).catch((e) => Mt(this.view.state, e)).then(() => this.workScheduled--), t.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), re = /* @__PURE__ */ D.define({
  combine(s) {
    return s.length ? s[0] : null;
  },
  enables: (s) => [
    Tt.state,
    Cc,
    P.contentAttributes.compute([s], (t) => {
      let e = t.facet(s);
      return e && e.name ? { "data-language": e.name } : {};
    })
  ]
});
class md {
  /**
  Create a language support object.
  */
  constructor(t, e = []) {
    this.language = t, this.support = e, this.extension = [t, e];
  }
}
const Ac = /* @__PURE__ */ D.define(), Ds = /* @__PURE__ */ D.define({
  combine: (s) => {
    if (!s.length)
      return "  ";
    let t = s[0];
    if (!t || /\S/.test(t) || Array.from(t).some((e) => e != t[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(s[0]));
    return t;
  }
});
function Mc(s) {
  let t = s.facet(Ds);
  return t.charCodeAt(0) == 9 ? s.tabSize * t.length : t.length;
}
function Oc(s, t) {
  let e = "", i = s.tabSize, n = s.facet(Ds)[0];
  if (n == "	") {
    for (; t >= i; )
      e += "	", t -= i;
    n = " ";
  }
  for (let r = 0; r < t; r++)
    e += n;
  return e;
}
function Dc(s, t) {
  s instanceof F && (s = new Jl(s));
  for (let i of s.state.facet(Ac)) {
    let n = i(s, t);
    if (n !== void 0)
      return n;
  }
  let e = mt(s.state);
  return e ? Pc(s, e, t) : null;
}
class Jl {
  /**
  Create an indent context.
  */
  constructor(t, e = {}) {
    this.state = t, this.options = e, this.unit = Mc(t);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(t, e = 1) {
    let i = this.state.doc.lineAt(t), { simulateBreak: n, simulateDoubleBreak: r } = this.options;
    return n != null && n >= i.from && n <= i.to ? r && n == t ? { text: "", from: t } : (e < 0 ? n < t : n <= t) ? { text: i.text.slice(n - i.from), from: n } : { text: i.text.slice(0, n - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(t, e = 1) {
    if (this.options.simulateDoubleBreak && t == this.options.simulateBreak)
      return "";
    let { text: i, from: n } = this.lineAt(t, e);
    return i.slice(t - n, Math.min(i.length, t + 100 - n));
  }
  /**
  Find the column for the given position.
  */
  column(t, e = 1) {
    let { text: i, from: n } = this.lineAt(t, e), r = this.countColumn(i, t - n), o = this.options.overrideIndentation ? this.options.overrideIndentation(n) : -1;
    return o > -1 && (r += o - this.countColumn(i, i.search(/\S|$/))), r;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(t, e = t.length) {
    return ms(t, this.state.tabSize, e);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(t, e = 1) {
    let { text: i, from: n } = this.lineAt(t, e), r = this.options.overrideIndentation;
    if (r) {
      let o = r(n);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Tc = /* @__PURE__ */ new E();
function Pc(s, t, e) {
  return Yl(t.resolveInner(e).enterUnfinishedNodesBefore(e), e, s);
}
function Bc(s) {
  return s.pos == s.options.simulateBreak && s.options.simulateDoubleBreak;
}
function Rc(s) {
  let t = s.type.prop(Tc);
  if (t)
    return t;
  let e = s.firstChild, i;
  if (e && (i = e.type.prop(E.closedBy))) {
    let n = s.lastChild, r = n && i.indexOf(n.name) > -1;
    return (o) => Xl(o, !0, 1, void 0, r && !Bc(o) ? n.from : void 0);
  }
  return s.parent == null ? Ec : null;
}
function Yl(s, t, e) {
  for (; s; s = s.parent) {
    let i = Rc(s);
    if (i)
      return i(Ts.create(e, t, s));
  }
  return null;
}
function Ec() {
  return 0;
}
class Ts extends Jl {
  constructor(t, e, i) {
    super(t.state, t.options), this.base = t, this.pos = e, this.node = i;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new Ts(t, e, i);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(t) {
    let e = this.state.doc.lineAt(t.from);
    for (; ; ) {
      let i = t.resolve(e.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (Lc(i, t))
        break;
      e = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(e.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    let t = this.node.parent;
    return t ? Yl(t, this.pos, this.base) : 0;
  }
}
function Lc(s, t) {
  for (let e = t; e; e = e.parent)
    if (s == e)
      return !0;
  return !1;
}
function Ic(s) {
  let t = s.node, e = t.childAfter(t.from), i = t.lastChild;
  if (!e)
    return null;
  let n = s.options.simulateBreak, r = s.state.doc.lineAt(e.from), o = n == null || n <= r.from ? r.to : Math.min(r.to, n);
  for (let l = e.to; ; ) {
    let a = t.childAfter(l);
    if (!a || a == i)
      return null;
    if (!a.type.isSkipped)
      return a.from < o ? e : null;
    l = a.to;
  }
}
function yd({ closing: s, align: t = !0, units: e = 1 }) {
  return (i) => Xl(i, t, e, s);
}
function Xl(s, t, e, i, n) {
  let r = s.textAfter, o = r.match(/^\s*/)[0].length, l = i && r.slice(o, o + i.length) == i || n == s.pos + o, a = t ? Ic(s) : null;
  return a ? l ? s.column(a.from) : s.column(a.to) : s.baseIndent + (l ? 0 : s.unit * e);
}
const bd = (s) => s.baseIndent;
function wd({ except: s, units: t = 1 } = {}) {
  return (e) => {
    let i = s && s.test(e.textAfter);
    return e.baseIndent + (i ? 0 : t * e.unit);
  };
}
const Nc = 200;
function xd() {
  return F.transactionFilter.of((s) => {
    if (!s.docChanged || !s.isUserEvent("input.type") && !s.isUserEvent("input.complete"))
      return s;
    let t = s.startState.languageDataAt("indentOnInput", s.startState.selection.main.head);
    if (!t.length)
      return s;
    let e = s.newDoc, { head: i } = s.newSelection.main, n = e.lineAt(i);
    if (i > n.from + Nc)
      return s;
    let r = e.sliceString(n.from, i);
    if (!t.some((h) => h.test(r)))
      return s;
    let { state: o } = s, l = -1, a = [];
    for (let { head: h } of o.selection.ranges) {
      let f = o.doc.lineAt(h);
      if (f.from == l)
        continue;
      l = f.from;
      let c = Dc(o, f.from);
      if (c == null)
        continue;
      let u = /^\s*/.exec(f.text)[0], d = Oc(o, c);
      u != d && a.push({ from: f.from, to: f.from + u.length, insert: d });
    }
    return a.length ? [s, { changes: a, sequential: !0 }] : s;
  });
}
const Hc = /* @__PURE__ */ D.define(), Fc = /* @__PURE__ */ new E();
function vd(s) {
  let t = s.firstChild, e = s.lastChild;
  return t && t.to < e.from ? { from: t.to, to: e.type.isError ? s.to : e.from } : null;
}
function Vc(s, t, e) {
  let i = mt(s);
  if (i.length < e)
    return null;
  let n = i.resolveInner(e, 1), r = null;
  for (let o = n; o; o = o.parent) {
    if (o.to <= e || o.from > e)
      continue;
    if (r && o.from < t)
      break;
    let l = o.type.prop(Fc);
    if (l && (o.to < i.length - 50 || i.length == s.doc.length || !Wc(o))) {
      let a = l(o, s);
      a && a.from <= e && a.from >= t && a.to > e && (r = a);
    }
  }
  return r;
}
function Wc(s) {
  let t = s.lastChild;
  return t && t.to == s.to && t.type.isError;
}
function Ji(s, t, e) {
  for (let i of s.facet(Hc)) {
    let n = i(s, t, e);
    if (n)
      return n;
  }
  return Vc(s, t, e);
}
function Ql(s, t) {
  let e = t.mapPos(s.from, 1), i = t.mapPos(s.to, -1);
  return e >= i ? void 0 : { from: e, to: i };
}
const nn = /* @__PURE__ */ L.define({ map: Ql }), oi = /* @__PURE__ */ L.define({ map: Ql });
function Zl(s) {
  let t = [];
  for (let { head: e } of s.state.selection.ranges)
    t.some((i) => i.from <= e && i.to >= e) || t.push(s.lineBlockAt(e));
  return t;
}
const me = /* @__PURE__ */ yt.define({
  create() {
    return I.none;
  },
  update(s, t) {
    s = s.map(t.changes);
    for (let e of t.effects)
      e.is(nn) && !zc(s, e.value.from, e.value.to) ? s = s.update({ add: [to.range(e.value.from, e.value.to)] }) : e.is(oi) && (s = s.update({
        filter: (i, n) => e.value.from != i || e.value.to != n,
        filterFrom: e.value.from,
        filterTo: e.value.to
      }));
    if (t.selection) {
      let e = !1, { head: i } = t.selection.main;
      s.between(i, i, (n, r) => {
        n < i && r > i && (e = !0);
      }), e && (s = s.update({
        filterFrom: i,
        filterTo: i,
        filter: (n, r) => r <= i || n >= i
      }));
    }
    return s;
  },
  provide: (s) => P.decorations.from(s),
  toJSON(s, t) {
    let e = [];
    return s.between(0, t.doc.length, (i, n) => {
      e.push(i, n);
    }), e;
  },
  fromJSON(s) {
    if (!Array.isArray(s) || s.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let t = [];
    for (let e = 0; e < s.length; ) {
      let i = s[e++], n = s[e++];
      if (typeof i != "number" || typeof n != "number")
        throw new RangeError("Invalid JSON for fold state");
      t.push(to.range(i, n));
    }
    return I.set(t, !0);
  }
});
function Yi(s, t, e) {
  var i;
  let n = null;
  return (i = s.field(me, !1)) === null || i === void 0 || i.between(t, e, (r, o) => {
    (!n || n.from > r) && (n = { from: r, to: o });
  }), n;
}
function zc(s, t, e) {
  let i = !1;
  return s.between(t, t, (n, r) => {
    n == t && r == e && (i = !0);
  }), i;
}
function ta(s, t) {
  return s.field(me, !1) ? t : t.concat(L.appendConfig.of(ia()));
}
const qc = (s) => {
  for (let t of Zl(s)) {
    let e = Ji(s.state, t.from, t.to);
    if (e)
      return s.dispatch({ effects: ta(s.state, [nn.of(e), ea(s, e)]) }), !0;
  }
  return !1;
}, jc = (s) => {
  if (!s.state.field(me, !1))
    return !1;
  let t = [];
  for (let e of Zl(s)) {
    let i = Yi(s.state, e.from, e.to);
    i && t.push(oi.of(i), ea(s, i, !1));
  }
  return t.length && s.dispatch({ effects: t }), t.length > 0;
};
function ea(s, t, e = !0) {
  let i = s.state.doc.lineAt(t.from).number, n = s.state.doc.lineAt(t.to).number;
  return P.announce.of(`${s.state.phrase(e ? "Folded lines" : "Unfolded lines")} ${i} ${s.state.phrase("to")} ${n}.`);
}
const Kc = (s) => {
  let { state: t } = s, e = [];
  for (let i = 0; i < t.doc.length; ) {
    let n = s.lineBlockAt(i), r = Ji(t, n.from, n.to);
    r && e.push(nn.of(r)), i = (r ? s.lineBlockAt(r.to) : n).to + 1;
  }
  return e.length && s.dispatch({ effects: ta(s.state, e) }), !!e.length;
}, $c = (s) => {
  let t = s.state.field(me, !1);
  if (!t || !t.size)
    return !1;
  let e = [];
  return t.between(0, s.state.doc.length, (i, n) => {
    e.push(oi.of({ from: i, to: n }));
  }), s.dispatch({ effects: e }), !0;
}, kd = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: qc },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: jc },
  { key: "Ctrl-Alt-[", run: Kc },
  { key: "Ctrl-Alt-]", run: $c }
], Uc = {
  placeholderDOM: null,
  placeholderText: "…"
}, Gc = /* @__PURE__ */ D.define({
  combine(s) {
    return Re(s, Uc);
  }
});
function ia(s) {
  return [me, Jc];
}
const to = /* @__PURE__ */ I.replace({ widget: /* @__PURE__ */ new class extends oe {
  toDOM(s) {
    let { state: t } = s, e = t.facet(Gc), i = (r) => {
      let o = s.lineBlockAt(s.posAtDOM(r.target)), l = Yi(s.state, o.from, o.to);
      l && s.dispatch({ effects: oi.of(l) }), r.preventDefault();
    };
    if (e.placeholderDOM)
      return e.placeholderDOM(s, i);
    let n = document.createElement("span");
    return n.textContent = e.placeholderText, n.setAttribute("aria-label", t.phrase("folded code")), n.title = t.phrase("unfold"), n.className = "cm-foldPlaceholder", n.onclick = i, n;
  }
}() }), _c = {
  openText: "⌄",
  closedText: "›",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class vn extends Ut {
  constructor(t, e) {
    super(), this.config = t, this.open = e;
  }
  eq(t) {
    return this.config == t.config && this.open == t.open;
  }
  toDOM(t) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let e = document.createElement("span");
    return e.textContent = this.open ? this.config.openText : this.config.closedText, e.title = t.state.phrase(this.open ? "Fold line" : "Unfold line"), e;
  }
}
function Sd(s = {}) {
  let t = Object.assign(Object.assign({}, _c), s), e = new vn(t, !0), i = new vn(t, !1), n = tt.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(re) != o.state.facet(re) || o.startState.field(me, !1) != o.state.field(me, !1) || mt(o.startState) != mt(o.state) || t.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let l = new pe();
      for (let a of o.viewportLineBlocks) {
        let h = Yi(o.state, a.from, a.to) ? i : Ji(o.state, a.from, a.to) ? e : null;
        h && l.add(a.from, a.from, h);
      }
      return l.finish();
    }
  }), { domEventHandlers: r } = t;
  return [
    n,
    jf({
      class: "cm-foldGutter",
      markers(o) {
        var l;
        return ((l = o.plugin(n)) === null || l === void 0 ? void 0 : l.markers) || W.empty;
      },
      initialSpacer() {
        return new vn(t, !1);
      },
      domEventHandlers: Object.assign(Object.assign({}, r), { click: (o, l, a) => {
        if (r.click && r.click(o, l, a))
          return !0;
        let h = Yi(o.state, l.from, l.to);
        if (h)
          return o.dispatch({ effects: oi.of(h) }), !0;
        let f = Ji(o.state, l.from, l.to);
        return f ? (o.dispatch({ effects: nn.of(f) }), !0) : !1;
      } })
    }),
    ia()
  ];
}
const Jc = /* @__PURE__ */ P.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class sn {
  constructor(t, e) {
    this.specs = t;
    let i;
    function n(l) {
      let a = te.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const r = typeof e.all == "string" ? e.all : e.all ? n(e.all) : void 0, o = e.scope;
    this.scope = o instanceof Tt ? (l) => l.prop(ke) == o.data : o ? (l) => l == o : void 0, this.style = Gl(t.map((l) => ({
      tag: l.tag,
      class: l.class || n(Object.assign({}, l, { tag: null }))
    })), {
      all: r
    }).style, this.module = i ? new te(i) : null, this.themeType = e.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(t, e) {
    return new sn(t, e || {});
  }
}
const hs = /* @__PURE__ */ D.define(), na = /* @__PURE__ */ D.define({
  combine(s) {
    return s.length ? [s[0]] : null;
  }
});
function kn(s) {
  let t = s.facet(hs);
  return t.length ? t : s.facet(na);
}
function Cd(s, t) {
  let e = [Xc], i;
  return s instanceof sn && (s.module && e.push(P.styleModule.of(s.module)), i = s.themeType), t != null && t.fallback ? e.push(na.of(s)) : i ? e.push(hs.computeN([P.darkTheme], (n) => n.facet(P.darkTheme) == (i == "dark") ? [s] : [])) : e.push(hs.of(s)), e;
}
class Yc {
  constructor(t) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = mt(t.state), this.decorations = this.buildDeco(t, kn(t.state));
  }
  update(t) {
    let e = mt(t.state), i = kn(t.state), n = i != kn(t.startState);
    e.length < t.view.viewport.to && !n && e.type == this.tree.type ? this.decorations = this.decorations.map(t.changes) : (e != this.tree || t.viewportChanged || n) && (this.tree = e, this.decorations = this.buildDeco(t.view, i));
  }
  buildDeco(t, e) {
    if (!e || !this.tree.length)
      return I.none;
    let i = new pe();
    for (let { from: n, to: r } of t.visibleRanges)
      bc(this.tree, e, (o, l, a) => {
        i.add(o, l, this.markCache[a] || (this.markCache[a] = I.mark({ class: a })));
      }, n, r);
    return i.finish();
  }
}
const Xc = /* @__PURE__ */ Be.high(/* @__PURE__ */ tt.fromClass(Yc, {
  decorations: (s) => s.decorations
})), Ad = /* @__PURE__ */ sn.define([
  {
    tag: k.meta,
    color: "#404740"
  },
  {
    tag: k.link,
    textDecoration: "underline"
  },
  {
    tag: k.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: k.emphasis,
    fontStyle: "italic"
  },
  {
    tag: k.strong,
    fontWeight: "bold"
  },
  {
    tag: k.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: k.keyword,
    color: "#708"
  },
  {
    tag: [k.atom, k.bool, k.url, k.contentSeparator, k.labelName],
    color: "#219"
  },
  {
    tag: [k.literal, k.inserted],
    color: "#164"
  },
  {
    tag: [k.string, k.deleted],
    color: "#a11"
  },
  {
    tag: [k.regexp, k.escape, /* @__PURE__ */ k.special(k.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ k.definition(k.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ k.local(k.variableName),
    color: "#30a"
  },
  {
    tag: [k.typeName, k.namespace],
    color: "#085"
  },
  {
    tag: k.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ k.special(k.variableName), k.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ k.definition(k.propertyName),
    color: "#00c"
  },
  {
    tag: k.comment,
    color: "#940"
  },
  {
    tag: k.invalid,
    color: "#f00"
  }
]), Qc = /* @__PURE__ */ P.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), sa = 1e4, ra = "()[]{}", oa = /* @__PURE__ */ D.define({
  combine(s) {
    return Re(s, {
      afterCursor: !0,
      brackets: ra,
      maxScanDistance: sa,
      renderMatch: eu
    });
  }
}), Zc = /* @__PURE__ */ I.mark({ class: "cm-matchingBracket" }), tu = /* @__PURE__ */ I.mark({ class: "cm-nonmatchingBracket" });
function eu(s) {
  let t = [], e = s.matched ? Zc : tu;
  return t.push(e.range(s.start.from, s.start.to)), s.end && t.push(e.range(s.end.from, s.end.to)), t;
}
const iu = /* @__PURE__ */ yt.define({
  create() {
    return I.none;
  },
  update(s, t) {
    if (!t.docChanged && !t.selection)
      return s;
    let e = [], i = t.state.facet(oa);
    for (let n of t.state.selection.ranges) {
      if (!n.empty)
        continue;
      let r = Ai(t.state, n.head, -1, i) || n.head > 0 && Ai(t.state, n.head - 1, 1, i) || i.afterCursor && (Ai(t.state, n.head, 1, i) || n.head < t.state.doc.length && Ai(t.state, n.head + 1, -1, i));
      r && (e = e.concat(i.renderMatch(r, t.state)));
    }
    return I.set(e, !0);
  },
  provide: (s) => P.decorations.from(s)
}), nu = [
  iu,
  Qc
];
function Md(s = {}) {
  return [oa.of(s), nu];
}
const su = /* @__PURE__ */ new E();
function fs(s, t, e) {
  let i = s.prop(t < 0 ? E.openedBy : E.closedBy);
  if (i)
    return i;
  if (s.name.length == 1) {
    let n = e.indexOf(s.name);
    if (n > -1 && n % 2 == (t < 0 ? 1 : 0))
      return [e[n + t]];
  }
  return null;
}
function cs(s) {
  let t = s.type.prop(su);
  return t ? t(s.node) : s;
}
function Ai(s, t, e, i = {}) {
  let n = i.maxScanDistance || sa, r = i.brackets || ra, o = mt(s), l = o.resolveInner(t, e);
  for (let a = l; a; a = a.parent) {
    let h = fs(a.type, e, r);
    if (h && a.from < a.to) {
      let f = cs(a);
      if (f && (e > 0 ? t >= f.from && t < f.to : t > f.from && t <= f.to))
        return ru(s, t, e, a, f, h, r);
    }
  }
  return ou(s, t, e, o, l.type, n, r);
}
function ru(s, t, e, i, n, r, o) {
  let l = i.parent, a = { from: n.from, to: n.to }, h = 0, f = l == null ? void 0 : l.cursor();
  if (f && (e < 0 ? f.childBefore(i.from) : f.childAfter(i.to)))
    do
      if (e < 0 ? f.to <= i.from : f.from >= i.to) {
        if (h == 0 && r.indexOf(f.type.name) > -1 && f.from < f.to) {
          let c = cs(f);
          return { start: a, end: c ? { from: c.from, to: c.to } : void 0, matched: !0 };
        } else if (fs(f.type, e, o))
          h++;
        else if (fs(f.type, -e, o)) {
          if (h == 0) {
            let c = cs(f);
            return {
              start: a,
              end: c && c.from < c.to ? { from: c.from, to: c.to } : void 0,
              matched: !1
            };
          }
          h--;
        }
      }
    while (e < 0 ? f.prevSibling() : f.nextSibling());
  return { start: a, matched: !1 };
}
function ou(s, t, e, i, n, r, o) {
  let l = e < 0 ? s.sliceDoc(t - 1, t) : s.sliceDoc(t, t + 1), a = o.indexOf(l);
  if (a < 0 || a % 2 == 0 != e > 0)
    return null;
  let h = { from: e < 0 ? t - 1 : t, to: e > 0 ? t + 1 : t }, f = s.doc.iterRange(t, e > 0 ? s.doc.length : 0), c = 0;
  for (let u = 0; !f.next().done && u <= r; ) {
    let d = f.value;
    e < 0 && (u += d.length);
    let p = t + u * e;
    for (let g = e > 0 ? 0 : d.length - 1, m = e > 0 ? d.length : -1; g != m; g += e) {
      let y = o.indexOf(d[g]);
      if (!(y < 0 || i.resolveInner(p + g, 1).type != n))
        if (y % 2 == 0 == e > 0)
          c++;
        else {
          if (c == 1)
            return { start: h, end: { from: p + g, to: p + g + 1 }, matched: y >> 1 == a >> 1 };
          c--;
        }
    }
    e > 0 && (u += d.length);
  }
  return f.done ? { start: h, matched: !1 } : null;
}
const lu = /* @__PURE__ */ Object.create(null), eo = [gt.none], io = [], au = /* @__PURE__ */ Object.create(null);
for (let [s, t] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  au[s] = /* @__PURE__ */ hu(lu, t);
function Sn(s, t) {
  io.indexOf(s) > -1 || (io.push(s), console.warn(t));
}
function hu(s, t) {
  let e = null;
  for (let r of t.split(".")) {
    let o = s[r] || k[r];
    o ? typeof o == "function" ? e ? e = o(e) : Sn(r, `Modifier ${r} used at start of tag`) : e ? Sn(r, `Tag ${r} used as modifier`) : e = o : Sn(r, `Unknown highlighting tag ${r}`);
  }
  if (!e)
    return 0;
  let i = t.replace(/ /g, "_"), n = gt.define({
    id: eo.length,
    name: i,
    props: [mc({ [i]: e })]
  });
  return eo.push(n), n.id;
}
class la {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(t, e, i) {
    this.state = t, this.pos = e, this.explicit = i, this.abortListeners = [];
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(t) {
    let e = mt(this.state).resolveInner(this.pos, -1);
    for (; e && t.indexOf(e.name) < 0; )
      e = e.parent;
    return e ? {
      from: e.from,
      to: this.pos,
      text: this.state.sliceDoc(e.from, this.pos),
      type: e.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(t) {
    let e = this.state.doc.lineAt(this.pos), i = Math.max(e.from, this.pos - 250), n = e.text.slice(i - e.from, this.pos - e.from), r = n.search(aa(t, !1));
    return r < 0 ? null : { from: i + r, to: this.pos, text: n.slice(r) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  */
  addEventListener(t, e) {
    t == "abort" && this.abortListeners && this.abortListeners.push(e);
  }
}
function no(s) {
  let t = Object.keys(s).join(""), e = /\w/.test(t);
  return e && (t = t.replace(/\w/g, "")), `[${e ? "\\w" : ""}${t.replace(/[^\w\s]/g, "\\$&")}]`;
}
function fu(s) {
  let t = /* @__PURE__ */ Object.create(null), e = /* @__PURE__ */ Object.create(null);
  for (let { label: n } of s) {
    t[n[0]] = !0;
    for (let r = 1; r < n.length; r++)
      e[n[r]] = !0;
  }
  let i = no(t) + no(e) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function cu(s) {
  let t = s.map((n) => typeof n == "string" ? { label: n } : n), [e, i] = t.every((n) => /^\w+$/.test(n.label)) ? [/\w*$/, /\w+$/] : fu(t);
  return (n) => {
    let r = n.matchBefore(i);
    return r || n.explicit ? { from: r ? r.from : n.pos, options: t, validFor: e } : null;
  };
}
function Od(s, t) {
  return (e) => {
    for (let i = mt(e.state).resolveInner(e.pos, -1); i; i = i.parent) {
      if (s.indexOf(i.name) > -1)
        return null;
      if (i.type.isTop)
        break;
    }
    return t(e);
  };
}
class so {
  constructor(t, e, i, n) {
    this.completion = t, this.source = e, this.match = i, this.score = n;
  }
}
function Zt(s) {
  return s.selection.main.from;
}
function aa(s, t) {
  var e;
  let { source: i } = s, n = t && i[0] != "^", r = i[i.length - 1] != "$";
  return !n && !r ? s : new RegExp(`${n ? "^" : ""}(?:${i})${r ? "$" : ""}`, (e = s.flags) !== null && e !== void 0 ? e : s.ignoreCase ? "i" : "");
}
const ha = /* @__PURE__ */ ye.define();
function uu(s, t, e, i) {
  let { main: n } = s.selection, r = e - n.from, o = i - n.from;
  return Object.assign(Object.assign({}, s.changeByRange((l) => l != n && e != i && s.sliceDoc(l.from + r, l.from + o) != s.sliceDoc(e, i) ? { range: l } : {
    changes: { from: l.from + r, to: i == n.from ? l.to : l.from + o, insert: t },
    range: v.cursor(l.from + r + t.length)
  })), { userEvent: "input.complete" });
}
const ro = /* @__PURE__ */ new WeakMap();
function du(s) {
  if (!Array.isArray(s))
    return s;
  let t = ro.get(s);
  return t || ro.set(s, t = cu(s)), t;
}
const Ps = /* @__PURE__ */ L.define(), ti = /* @__PURE__ */ L.define();
class pu {
  constructor(t) {
    this.pattern = t, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [], this.score = 0, this.matched = [];
    for (let e = 0; e < t.length; ) {
      let i = ot(t, e), n = Dt(i);
      this.chars.push(i);
      let r = t.slice(e, e + n), o = r.toUpperCase();
      this.folded.push(ot(o == r ? r.toLowerCase() : o, 0)), e += n;
    }
    this.astral = t.length != this.chars.length;
  }
  ret(t, e) {
    return this.score = t, this.matched = e, !0;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(t) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (t.length < this.pattern.length)
      return !1;
    let { chars: e, folded: i, any: n, precise: r, byWord: o } = this;
    if (e.length == 1) {
      let w = ot(t, 0), M = Dt(w), S = M == t.length ? 0 : -100;
      if (w != e[0]) if (w == i[0])
        S += -200;
      else
        return !1;
      return this.ret(S, [0, M]);
    }
    let l = t.indexOf(this.pattern);
    if (l == 0)
      return this.ret(t.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let a = e.length, h = 0;
    if (l < 0) {
      for (let w = 0, M = Math.min(t.length, 200); w < M && h < a; ) {
        let S = ot(t, w);
        (S == e[h] || S == i[h]) && (n[h++] = w), w += Dt(S);
      }
      if (h < a)
        return !1;
    }
    let f = 0, c = 0, u = !1, d = 0, p = -1, g = -1, m = /[a-z]/.test(t), y = !0;
    for (let w = 0, M = Math.min(t.length, 200), S = 0; w < M && c < a; ) {
      let b = ot(t, w);
      l < 0 && (f < a && b == e[f] && (r[f++] = w), d < a && (b == e[d] || b == i[d] ? (d == 0 && (p = w), g = w + 1, d++) : d = 0));
      let A, C = b < 255 ? b >= 48 && b <= 57 || b >= 97 && b <= 122 ? 2 : b >= 65 && b <= 90 ? 1 : 0 : (A = xo(b)) != A.toLowerCase() ? 1 : A != A.toUpperCase() ? 2 : 0;
      (!w || C == 1 && m || S == 0 && C != 0) && (e[c] == b || i[c] == b && (u = !0) ? o[c++] = w : o.length && (y = !1)), S = C, w += Dt(b);
    }
    return c == a && o[0] == 0 && y ? this.result(-100 + (u ? -200 : 0), o, t) : d == a && p == 0 ? this.ret(-200 - t.length + (g == t.length ? 0 : -100), [0, g]) : l > -1 ? this.ret(-700 - t.length, [l, l + this.pattern.length]) : d == a ? this.ret(-900 - t.length, [p, g]) : c == a ? this.result(-100 + (u ? -200 : 0) + -700 + (y ? 0 : -1100), o, t) : e.length == 2 ? !1 : this.result((n[0] ? -700 : 0) + -200 + -1100, n, t);
  }
  result(t, e, i) {
    let n = [], r = 0;
    for (let o of e) {
      let l = o + (this.astral ? Dt(ot(i, o)) : 1);
      r && n[r - 1] == o ? n[r - 1] = l : (n[r++] = o, n[r++] = l);
    }
    return this.ret(t - i.length, n);
  }
}
const pt = /* @__PURE__ */ D.define({
  combine(s) {
    return Re(s, {
      activateOnTyping: !0,
      selectOnOpen: !0,
      override: null,
      closeOnBlur: !0,
      maxRenderedOptions: 100,
      defaultKeymap: !0,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: !1,
      icons: !0,
      addToOptions: [],
      positionInfo: gu,
      compareCompletions: (t, e) => t.label.localeCompare(e.label),
      interactionDelay: 75
    }, {
      defaultKeymap: (t, e) => t && e,
      closeOnBlur: (t, e) => t && e,
      icons: (t, e) => t && e,
      tooltipClass: (t, e) => (i) => oo(t(i), e(i)),
      optionClass: (t, e) => (i) => oo(t(i), e(i)),
      addToOptions: (t, e) => t.concat(e)
    });
  }
});
function oo(s, t) {
  return s ? t ? s + " " + t : s : t;
}
function gu(s, t, e, i, n) {
  let r = s.textDirection == J.RTL, o = r, l = !1, a = "top", h, f, c = t.left - n.left, u = n.right - t.right, d = i.right - i.left, p = i.bottom - i.top;
  if (o && c < Math.min(d, u) ? o = !1 : !o && u < Math.min(d, c) && (o = !0), d <= (o ? c : u))
    h = Math.max(n.top, Math.min(e.top, n.bottom - p)) - t.top, f = Math.min(400, o ? c : u);
  else {
    l = !0, f = Math.min(
      400,
      (r ? t.right : n.right - t.left) - 30
      /* Margin */
    );
    let g = n.bottom - t.bottom;
    g >= p || g > t.top ? h = e.bottom - t.top : (a = "bottom", h = t.bottom - e.top);
  }
  return {
    style: `${a}: ${h}px; max-width: ${f}px`,
    class: "cm-completionInfo-" + (l ? r ? "left-narrow" : "right-narrow" : o ? "left" : "right")
  };
}
function mu(s) {
  let t = s.addToOptions.slice();
  return s.icons && t.push({
    render(e) {
      let i = document.createElement("div");
      return i.classList.add("cm-completionIcon"), e.type && i.classList.add(...e.type.split(/\s+/g).map((n) => "cm-completionIcon-" + n)), i.setAttribute("aria-hidden", "true"), i;
    },
    position: 20
  }), t.push({
    render(e, i, n) {
      let r = document.createElement("span");
      r.className = "cm-completionLabel";
      let o = e.displayLabel || e.label, l = 0;
      for (let a = 0; a < n.length; ) {
        let h = n[a++], f = n[a++];
        h > l && r.appendChild(document.createTextNode(o.slice(l, h)));
        let c = r.appendChild(document.createElement("span"));
        c.appendChild(document.createTextNode(o.slice(h, f))), c.className = "cm-completionMatchedText", l = f;
      }
      return l < o.length && r.appendChild(document.createTextNode(o.slice(l))), r;
    },
    position: 50
  }, {
    render(e) {
      if (!e.detail)
        return null;
      let i = document.createElement("span");
      return i.className = "cm-completionDetail", i.textContent = e.detail, i;
    },
    position: 80
  }), t.sort((e, i) => e.position - i.position).map((e) => e.render);
}
function lo(s, t, e) {
  if (s <= e)
    return { from: 0, to: s };
  if (t < 0 && (t = 0), t <= s >> 1) {
    let n = Math.floor(t / e);
    return { from: n * e, to: (n + 1) * e };
  }
  let i = Math.floor((s - t) / e);
  return { from: s - (i + 1) * e, to: s - i * e };
}
class yu {
  constructor(t, e, i) {
    this.view = t, this.stateField = e, this.applyCompletion = i, this.info = null, this.infoDestroy = null, this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (a) => this.placeInfo(a),
      key: this
    }, this.space = null, this.currentClass = "";
    let n = t.state.field(e), { options: r, selected: o } = n.open, l = t.state.facet(pt);
    this.optionContent = mu(l), this.optionClass = l.optionClass, this.tooltipClass = l.tooltipClass, this.range = lo(r.length, o, l.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.updateTooltipClass(t.state), this.dom.addEventListener("mousedown", (a) => {
      for (let h = a.target, f; h && h != this.dom; h = h.parentNode)
        if (h.nodeName == "LI" && (f = /-(\d+)$/.exec(h.id)) && +f[1] < r.length) {
          this.applyCompletion(t, r[+f[1]]), a.preventDefault();
          return;
        }
    }), this.dom.addEventListener("focusout", (a) => {
      let h = t.state.field(this.stateField, !1);
      h && h.tooltip && t.state.facet(pt).closeOnBlur && a.relatedTarget != t.contentDOM && t.dispatch({ effects: ti.of(null) });
    }), this.list = this.dom.appendChild(this.createListBox(r, n.id, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfoReq);
    });
  }
  mount() {
    this.updateSel();
  }
  update(t) {
    var e, i, n;
    let r = t.state.field(this.stateField), o = t.startState.field(this.stateField);
    this.updateTooltipClass(t.state), r != o && (this.updateSel(), ((e = r.open) === null || e === void 0 ? void 0 : e.disabled) != ((i = o.open) === null || i === void 0 ? void 0 : i.disabled) && this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!(!((n = r.open) === null || n === void 0) && n.disabled)));
  }
  updateTooltipClass(t) {
    let e = this.tooltipClass(t);
    if (e != this.currentClass) {
      for (let i of this.currentClass.split(" "))
        i && this.dom.classList.remove(i);
      for (let i of e.split(" "))
        i && this.dom.classList.add(i);
      this.currentClass = e;
    }
  }
  positioned(t) {
    this.space = t, this.info && this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let t = this.view.state.field(this.stateField), e = t.open;
    if ((e.selected > -1 && e.selected < this.range.from || e.selected >= this.range.to) && (this.range = lo(e.options.length, e.selected, this.view.state.facet(pt).maxRenderedOptions), this.list.remove(), this.list = this.dom.appendChild(this.createListBox(e.options, t.id, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfoReq);
    })), this.updateSelectedOption(e.selected)) {
      this.destroyInfo();
      let { completion: i } = e.options[e.selected], { info: n } = i;
      if (!n)
        return;
      let r = typeof n == "string" ? document.createTextNode(n) : n(i);
      if (!r)
        return;
      "then" in r ? r.then((o) => {
        o && this.view.state.field(this.stateField, !1) == t && this.addInfoPane(o, i);
      }).catch((o) => Mt(this.view.state, o, "completion info")) : this.addInfoPane(r, i);
    }
  }
  addInfoPane(t, e) {
    this.destroyInfo();
    let i = this.info = document.createElement("div");
    if (i.className = "cm-tooltip cm-completionInfo", t.nodeType != null)
      i.appendChild(t), this.infoDestroy = null;
    else {
      let { dom: n, destroy: r } = t;
      i.appendChild(n), this.infoDestroy = r || null;
    }
    this.dom.appendChild(i), this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(t) {
    let e = null;
    for (let i = this.list.firstChild, n = this.range.from; i; i = i.nextSibling, n++)
      i.nodeName != "LI" || !i.id ? n-- : n == t ? i.hasAttribute("aria-selected") || (i.setAttribute("aria-selected", "true"), e = i) : i.hasAttribute("aria-selected") && i.removeAttribute("aria-selected");
    return e && wu(this.list, e), e;
  }
  measureInfo() {
    let t = this.dom.querySelector("[aria-selected]");
    if (!t || !this.info)
      return null;
    let e = this.dom.getBoundingClientRect(), i = this.info.getBoundingClientRect(), n = t.getBoundingClientRect(), r = this.space;
    if (!r) {
      let o = this.dom.ownerDocument.defaultView || window;
      r = { left: 0, top: 0, right: o.innerWidth, bottom: o.innerHeight };
    }
    return n.top > Math.min(r.bottom, e.bottom) - 10 || n.bottom < Math.max(r.top, e.top) + 10 ? null : this.view.state.facet(pt).positionInfo(this.view, e, n, i, r);
  }
  placeInfo(t) {
    this.info && (t ? (t.style && (this.info.style.cssText = t.style), this.info.className = "cm-tooltip cm-completionInfo " + (t.class || "")) : this.info.style.cssText = "top: -1e6px");
  }
  createListBox(t, e, i) {
    const n = document.createElement("ul");
    n.id = e, n.setAttribute("role", "listbox"), n.setAttribute("aria-expanded", "true"), n.setAttribute("aria-label", this.view.state.phrase("Completions"));
    let r = null;
    for (let o = i.from; o < i.to; o++) {
      let { completion: l, match: a } = t[o], { section: h } = l;
      if (h) {
        let u = typeof h == "string" ? h : h.name;
        if (u != r && (o > i.from || i.from == 0))
          if (r = u, typeof h != "string" && h.header)
            n.appendChild(h.header(h));
          else {
            let d = n.appendChild(document.createElement("completion-section"));
            d.textContent = u;
          }
      }
      const f = n.appendChild(document.createElement("li"));
      f.id = e + "-" + o, f.setAttribute("role", "option");
      let c = this.optionClass(l);
      c && (f.className = c);
      for (let u of this.optionContent) {
        let d = u(l, this.view.state, a);
        d && f.appendChild(d);
      }
    }
    return i.from && n.classList.add("cm-completionListIncompleteTop"), i.to < t.length && n.classList.add("cm-completionListIncompleteBottom"), n;
  }
  destroyInfo() {
    this.info && (this.infoDestroy && this.infoDestroy(), this.info.remove(), this.info = null);
  }
  destroy() {
    this.destroyInfo();
  }
}
function bu(s, t) {
  return (e) => new yu(e, s, t);
}
function wu(s, t) {
  let e = s.getBoundingClientRect(), i = t.getBoundingClientRect();
  i.top < e.top ? s.scrollTop -= e.top - i.top : i.bottom > e.bottom && (s.scrollTop += i.bottom - e.bottom);
}
function ao(s) {
  return (s.boost || 0) * 100 + (s.apply ? 10 : 0) + (s.info ? 5 : 0) + (s.type ? 1 : 0);
}
function xu(s, t) {
  let e = [], i = null, n = (a) => {
    e.push(a);
    let { section: h } = a.completion;
    if (h) {
      i || (i = []);
      let f = typeof h == "string" ? h : h.name;
      i.some((c) => c.name == f) || i.push(typeof h == "string" ? { name: f } : h);
    }
  };
  for (let a of s)
    if (a.hasResult()) {
      let h = a.result.getMatch;
      if (a.result.filter === !1)
        for (let f of a.result.options)
          n(new so(f, a.source, h ? h(f) : [], 1e9 - e.length));
      else {
        let f = new pu(t.sliceDoc(a.from, a.to));
        for (let c of a.result.options)
          if (f.match(c.label)) {
            let u = c.displayLabel ? h ? h(c, f.matched) : [] : f.matched;
            n(new so(c, a.source, u, f.score + (c.boost || 0)));
          }
      }
    }
  if (i) {
    let a = /* @__PURE__ */ Object.create(null), h = 0, f = (c, u) => {
      var d, p;
      return ((d = c.rank) !== null && d !== void 0 ? d : 1e9) - ((p = u.rank) !== null && p !== void 0 ? p : 1e9) || (c.name < u.name ? -1 : 1);
    };
    for (let c of i.sort(f))
      h -= 1e5, a[c.name] = h;
    for (let c of e) {
      let { section: u } = c.completion;
      u && (c.score += a[typeof u == "string" ? u : u.name]);
    }
  }
  let r = [], o = null, l = t.facet(pt).compareCompletions;
  for (let a of e.sort((h, f) => f.score - h.score || l(h.completion, f.completion))) {
    let h = a.completion;
    !o || o.label != h.label || o.detail != h.detail || o.type != null && h.type != null && o.type != h.type || o.apply != h.apply || o.boost != h.boost ? r.push(a) : ao(a.completion) > ao(o) && (r[r.length - 1] = a), o = a.completion;
  }
  return r;
}
class Se {
  constructor(t, e, i, n, r, o) {
    this.options = t, this.attrs = e, this.tooltip = i, this.timestamp = n, this.selected = r, this.disabled = o;
  }
  setSelected(t, e) {
    return t == this.selected || t >= this.options.length ? this : new Se(this.options, ho(e, t), this.tooltip, this.timestamp, t, this.disabled);
  }
  static build(t, e, i, n, r) {
    let o = xu(t, e);
    if (!o.length)
      return n && t.some(
        (a) => a.state == 1
        /* Pending */
      ) ? new Se(n.options, n.attrs, n.tooltip, n.timestamp, n.selected, !0) : null;
    let l = e.facet(pt).selectOnOpen ? 0 : -1;
    if (n && n.selected != l && n.selected != -1) {
      let a = n.options[n.selected].completion;
      for (let h = 0; h < o.length; h++)
        if (o[h].completion == a) {
          l = h;
          break;
        }
    }
    return new Se(o, ho(i, l), {
      pos: t.reduce((a, h) => h.hasResult() ? Math.min(a, h.from) : a, 1e8),
      create: bu(xt, ua),
      above: r.aboveCursor
    }, n ? n.timestamp : Date.now(), l, !1);
  }
  map(t) {
    return new Se(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: t.mapPos(this.tooltip.pos) }), this.timestamp, this.selected, this.disabled);
  }
}
class Xi {
  constructor(t, e, i) {
    this.active = t, this.id = e, this.open = i;
  }
  static start() {
    return new Xi(Su, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(t) {
    let { state: e } = t, i = e.facet(pt), r = (i.override || e.languageDataAt("autocomplete", Zt(e)).map(du)).map((l) => (this.active.find((h) => h.source == l) || new dt(
      l,
      this.active.some(
        (h) => h.state != 0
        /* Inactive */
      ) ? 1 : 0
      /* Inactive */
    )).update(t, i));
    r.length == this.active.length && r.every((l, a) => l == this.active[a]) && (r = this.active);
    let o = this.open;
    o && t.docChanged && (o = o.map(t.changes)), t.selection || r.some((l) => l.hasResult() && t.changes.touchesRange(l.from, l.to)) || !vu(r, this.active) ? o = Se.build(r, e, this.id, o, i) : o && o.disabled && !r.some(
      (l) => l.state == 1
      /* Pending */
    ) && (o = null), !o && r.every(
      (l) => l.state != 1
      /* Pending */
    ) && r.some((l) => l.hasResult()) && (r = r.map((l) => l.hasResult() ? new dt(
      l.source,
      0
      /* Inactive */
    ) : l));
    for (let l of t.effects)
      l.is(ca) && (o = o && o.setSelected(l.value, this.id));
    return r == this.active && o == this.open ? this : new Xi(r, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : ku;
  }
}
function vu(s, t) {
  if (s == t)
    return !0;
  for (let e = 0, i = 0; ; ) {
    for (; e < s.length && !s[e].hasResult; )
      e++;
    for (; i < t.length && !t[i].hasResult; )
      i++;
    let n = e == s.length, r = i == t.length;
    if (n || r)
      return n == r;
    if (s[e++].result != t[i++].result)
      return !1;
  }
}
const ku = {
  "aria-autocomplete": "list"
};
function ho(s, t) {
  let e = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": s
  };
  return t > -1 && (e["aria-activedescendant"] = s + "-" + t), e;
}
const Su = [];
function us(s) {
  return s.isUserEvent("input.type") ? "input" : s.isUserEvent("delete.backward") ? "delete" : null;
}
class dt {
  constructor(t, e, i = -1) {
    this.source = t, this.state = e, this.explicitPos = i;
  }
  hasResult() {
    return !1;
  }
  update(t, e) {
    let i = us(t), n = this;
    i ? n = n.handleUserEvent(t, i, e) : t.docChanged ? n = n.handleChange(t) : t.selection && n.state != 0 && (n = new dt(
      n.source,
      0
      /* Inactive */
    ));
    for (let r of t.effects)
      if (r.is(Ps))
        n = new dt(n.source, 1, r.value ? Zt(t.state) : -1);
      else if (r.is(ti))
        n = new dt(
          n.source,
          0
          /* Inactive */
        );
      else if (r.is(fa))
        for (let o of r.value)
          o.source == n.source && (n = o);
    return n;
  }
  handleUserEvent(t, e, i) {
    return e == "delete" || !i.activateOnTyping ? this.map(t.changes) : new dt(
      this.source,
      1
      /* Pending */
    );
  }
  handleChange(t) {
    return t.changes.touchesRange(Zt(t.startState)) ? new dt(
      this.source,
      0
      /* Inactive */
    ) : this.map(t.changes);
  }
  map(t) {
    return t.empty || this.explicitPos < 0 ? this : new dt(this.source, this.state, t.mapPos(this.explicitPos));
  }
}
class Oe extends dt {
  constructor(t, e, i, n, r) {
    super(t, 2, e), this.result = i, this.from = n, this.to = r;
  }
  hasResult() {
    return !0;
  }
  handleUserEvent(t, e, i) {
    var n;
    let r = t.changes.mapPos(this.from), o = t.changes.mapPos(this.to, 1), l = Zt(t.state);
    if ((this.explicitPos < 0 ? l <= r : l < this.from) || l > o || e == "delete" && Zt(t.startState) == this.from)
      return new dt(
        this.source,
        e == "input" && i.activateOnTyping ? 1 : 0
        /* Inactive */
      );
    let a = this.explicitPos < 0 ? -1 : t.changes.mapPos(this.explicitPos), h;
    return Cu(this.result.validFor, t.state, r, o) ? new Oe(this.source, a, this.result, r, o) : this.result.update && (h = this.result.update(this.result, r, o, new la(t.state, l, a >= 0))) ? new Oe(this.source, a, h, h.from, (n = h.to) !== null && n !== void 0 ? n : Zt(t.state)) : new dt(this.source, 1, a);
  }
  handleChange(t) {
    return t.changes.touchesRange(this.from, this.to) ? new dt(
      this.source,
      0
      /* Inactive */
    ) : this.map(t.changes);
  }
  map(t) {
    return t.empty ? this : new Oe(this.source, this.explicitPos < 0 ? -1 : t.mapPos(this.explicitPos), this.result, t.mapPos(this.from), t.mapPos(this.to, 1));
  }
}
function Cu(s, t, e, i) {
  if (!s)
    return !1;
  let n = t.sliceDoc(e, i);
  return typeof s == "function" ? s(n, e, i, t) : aa(s, !0).test(n);
}
const fa = /* @__PURE__ */ L.define({
  map(s, t) {
    return s.map((e) => e.map(t));
  }
}), ca = /* @__PURE__ */ L.define(), xt = /* @__PURE__ */ yt.define({
  create() {
    return Xi.start();
  },
  update(s, t) {
    return s.update(t);
  },
  provide: (s) => [
    Ss.from(s, (t) => t.tooltip),
    P.contentAttributes.from(s, (t) => t.attrs)
  ]
});
function ua(s, t) {
  const e = t.completion.apply || t.completion.label;
  let i = s.state.field(xt).active.find((n) => n.source == t.source);
  return i instanceof Oe ? (typeof e == "string" ? s.dispatch(Object.assign(Object.assign({}, uu(s.state, e, i.from, i.to)), { annotations: ha.of(t.completion) })) : e(s, t.completion, i.from, i.to), !0) : !1;
}
function Mi(s, t = "option") {
  return (e) => {
    let i = e.state.field(xt, !1);
    if (!i || !i.open || i.open.disabled || Date.now() - i.open.timestamp < e.state.facet(pt).interactionDelay)
      return !1;
    let n = 1, r;
    t == "page" && (r = Fl(e, i.open.tooltip)) && (n = Math.max(2, Math.floor(r.dom.offsetHeight / r.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = i.open.options, l = i.open.selected > -1 ? i.open.selected + n * (s ? 1 : -1) : s ? 0 : o - 1;
    return l < 0 ? l = t == "page" ? 0 : o - 1 : l >= o && (l = t == "page" ? o - 1 : 0), e.dispatch({ effects: ca.of(l) }), !0;
  };
}
const Au = (s) => {
  let t = s.state.field(xt, !1);
  return s.state.readOnly || !t || !t.open || t.open.selected < 0 || t.open.disabled || Date.now() - t.open.timestamp < s.state.facet(pt).interactionDelay ? !1 : ua(s, t.open.options[t.open.selected]);
}, Mu = (s) => s.state.field(xt, !1) ? (s.dispatch({ effects: Ps.of(!0) }), !0) : !1, Ou = (s) => {
  let t = s.state.field(xt, !1);
  return !t || !t.active.some(
    (e) => e.state != 0
    /* Inactive */
  ) ? !1 : (s.dispatch({ effects: ti.of(null) }), !0);
};
class Du {
  constructor(t, e) {
    this.active = t, this.context = e, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const fo = 50, Tu = 50, Pu = 1e3, Bu = /* @__PURE__ */ tt.fromClass(class {
  constructor(s) {
    this.view = s, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.composing = 0;
    for (let t of s.state.field(xt).active)
      t.state == 1 && this.startQuery(t);
  }
  update(s) {
    let t = s.state.field(xt);
    if (!s.selectionSet && !s.docChanged && s.startState.field(xt) == t)
      return;
    let e = s.transactions.some((i) => (i.selection || i.docChanged) && !us(i));
    for (let i = 0; i < this.running.length; i++) {
      let n = this.running[i];
      if (e || n.updates.length + s.transactions.length > Tu && Date.now() - n.time > Pu) {
        for (let r of n.context.abortListeners)
          try {
            r();
          } catch (o) {
            Mt(this.view.state, o);
          }
        n.context.abortListeners = null, this.running.splice(i--, 1);
      } else
        n.updates.push(...s.transactions);
    }
    if (this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), this.debounceUpdate = t.active.some((i) => i.state == 1 && !this.running.some((n) => n.active.source == i.source)) ? setTimeout(() => this.startUpdate(), fo) : -1, this.composing != 0)
      for (let i of s.transactions)
        us(i) == "input" ? this.composing = 2 : this.composing == 2 && i.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1;
    let { state: s } = this.view, t = s.field(xt);
    for (let e of t.active)
      e.state == 1 && !this.running.some((i) => i.active.source == e.source) && this.startQuery(e);
  }
  startQuery(s) {
    let { state: t } = this.view, e = Zt(t), i = new la(t, e, s.explicitPos == e), n = new Du(s, i);
    this.running.push(n), Promise.resolve(s.source(i)).then((r) => {
      n.context.aborted || (n.done = r || null, this.scheduleAccept());
    }, (r) => {
      this.view.dispatch({ effects: ti.of(null) }), Mt(this.view.state, r);
    });
  }
  scheduleAccept() {
    this.running.every((s) => s.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), fo));
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var s;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let t = [], e = this.view.state.facet(pt);
    for (let i = 0; i < this.running.length; i++) {
      let n = this.running[i];
      if (n.done === void 0)
        continue;
      if (this.running.splice(i--, 1), n.done) {
        let o = new Oe(n.active.source, n.active.explicitPos, n.done, n.done.from, (s = n.done.to) !== null && s !== void 0 ? s : Zt(n.updates.length ? n.updates[0].startState : this.view.state));
        for (let l of n.updates)
          o = o.update(l, e);
        if (o.hasResult()) {
          t.push(o);
          continue;
        }
      }
      let r = this.view.state.field(xt).active.find((o) => o.source == n.active.source);
      if (r && r.state == 1)
        if (n.done == null) {
          let o = new dt(
            n.active.source,
            0
            /* Inactive */
          );
          for (let l of n.updates)
            o = o.update(l, e);
          o.state != 1 && t.push(o);
        } else
          this.startQuery(r);
    }
    t.length && this.view.dispatch({ effects: fa.of(t) });
  }
}, {
  eventHandlers: {
    blur(s) {
      let t = this.view.state.field(xt, !1);
      if (t && t.tooltip && this.view.state.facet(pt).closeOnBlur) {
        let e = t.open && Fl(this.view, t.open.tooltip);
        (!e || !e.dom.contains(s.relatedTarget)) && this.view.dispatch({ effects: ti.of(null) });
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: Ps.of(!1) }), 20), this.composing = 0;
    }
  }
}), da = /* @__PURE__ */ P.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class Ru {
  constructor(t, e, i, n) {
    this.field = t, this.line = e, this.from = i, this.to = n;
  }
}
class Bs {
  constructor(t, e, i) {
    this.field = t, this.from = e, this.to = i;
  }
  map(t) {
    let e = t.mapPos(this.from, -1, st.TrackDel), i = t.mapPos(this.to, 1, st.TrackDel);
    return e == null || i == null ? null : new Bs(this.field, e, i);
  }
}
class Rs {
  constructor(t, e) {
    this.lines = t, this.fieldPositions = e;
  }
  instantiate(t, e) {
    let i = [], n = [e], r = t.doc.lineAt(e), o = /^\s*/.exec(r.text)[0];
    for (let a of this.lines) {
      if (i.length) {
        let h = o, f = /^\t*/.exec(a)[0].length;
        for (let c = 0; c < f; c++)
          h += t.facet(Ds);
        n.push(e + h.length - f), a = h + a.slice(f);
      }
      i.push(a), e += a.length + 1;
    }
    let l = this.fieldPositions.map((a) => new Bs(a.field, n[a.line] + a.from, n[a.line] + a.to));
    return { text: i, ranges: l };
  }
  static parse(t) {
    let e = [], i = [], n = [], r;
    for (let o of t.split(/\r\n?|\n/)) {
      for (; r = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(o); ) {
        let l = r[1] ? +r[1] : null, a = r[2] || r[3] || "", h = -1;
        for (let f = 0; f < e.length; f++)
          (l != null ? e[f].seq == l : a && e[f].name == a) && (h = f);
        if (h < 0) {
          let f = 0;
          for (; f < e.length && (l == null || e[f].seq != null && e[f].seq < l); )
            f++;
          e.splice(f, 0, { seq: l, name: a }), h = f;
          for (let c of n)
            c.field >= h && c.field++;
        }
        n.push(new Ru(h, i.length, r.index, r.index + a.length)), o = o.slice(0, r.index) + a + o.slice(r.index + r[0].length);
      }
      for (let l; l = /\\([{}])/.exec(o); ) {
        o = o.slice(0, l.index) + l[1] + o.slice(l.index + l[0].length);
        for (let a of n)
          a.line == i.length && a.from > l.index && (a.from--, a.to--);
      }
      i.push(o);
    }
    return new Rs(i, n);
  }
}
let Eu = /* @__PURE__ */ I.widget({ widget: /* @__PURE__ */ new class extends oe {
  toDOM() {
    let s = document.createElement("span");
    return s.className = "cm-snippetFieldPosition", s;
  }
  ignoreEvent() {
    return !1;
  }
}() }), Lu = /* @__PURE__ */ I.mark({ class: "cm-snippetField" });
class Ee {
  constructor(t, e) {
    this.ranges = t, this.active = e, this.deco = I.set(t.map((i) => (i.from == i.to ? Eu : Lu).range(i.from, i.to)));
  }
  map(t) {
    let e = [];
    for (let i of this.ranges) {
      let n = i.map(t);
      if (!n)
        return null;
      e.push(n);
    }
    return new Ee(e, this.active);
  }
  selectionInsideField(t) {
    return t.ranges.every((e) => this.ranges.some((i) => i.field == this.active && i.from <= e.from && i.to >= e.to));
  }
}
const li = /* @__PURE__ */ L.define({
  map(s, t) {
    return s && s.map(t);
  }
}), Iu = /* @__PURE__ */ L.define(), ei = /* @__PURE__ */ yt.define({
  create() {
    return null;
  },
  update(s, t) {
    for (let e of t.effects) {
      if (e.is(li))
        return e.value;
      if (e.is(Iu) && s)
        return new Ee(s.ranges, e.value);
    }
    return s && t.docChanged && (s = s.map(t.changes)), s && t.selection && !s.selectionInsideField(t.selection) && (s = null), s;
  },
  provide: (s) => P.decorations.from(s, (t) => t ? t.deco : I.none)
});
function Es(s, t) {
  return v.create(s.filter((e) => e.field == t).map((e) => v.range(e.from, e.to)));
}
function Nu(s) {
  let t = Rs.parse(s);
  return (e, i, n, r) => {
    let { text: o, ranges: l } = t.instantiate(e.state, n), a = {
      changes: { from: n, to: r, insert: V.of(o) },
      scrollIntoView: !0,
      annotations: i ? ha.of(i) : void 0
    };
    if (l.length && (a.selection = Es(l, 0)), l.length > 1) {
      let h = new Ee(l, 0), f = a.effects = [li.of(h)];
      e.state.field(ei, !1) === void 0 && f.push(L.appendConfig.of([ei, zu, qu, da]));
    }
    e.dispatch(e.state.update(a));
  };
}
function pa(s) {
  return ({ state: t, dispatch: e }) => {
    let i = t.field(ei, !1);
    if (!i || s < 0 && i.active == 0)
      return !1;
    let n = i.active + s, r = s > 0 && !i.ranges.some((o) => o.field == n + s);
    return e(t.update({
      selection: Es(i.ranges, n),
      effects: li.of(r ? null : new Ee(i.ranges, n))
    })), !0;
  };
}
const Hu = ({ state: s, dispatch: t }) => s.field(ei, !1) ? (t(s.update({ effects: li.of(null) })), !0) : !1, Fu = /* @__PURE__ */ pa(1), Vu = /* @__PURE__ */ pa(-1), Wu = [
  { key: "Tab", run: Fu, shift: Vu },
  { key: "Escape", run: Hu }
], co = /* @__PURE__ */ D.define({
  combine(s) {
    return s.length ? s[0] : Wu;
  }
}), zu = /* @__PURE__ */ Be.highest(/* @__PURE__ */ ks.compute([co], (s) => s.facet(co)));
function Dd(s, t) {
  return Object.assign(Object.assign({}, t), { apply: Nu(s) });
}
const qu = /* @__PURE__ */ P.domEventHandlers({
  mousedown(s, t) {
    let e = t.state.field(ei, !1), i;
    if (!e || (i = t.posAtCoords({ x: s.clientX, y: s.clientY })) == null)
      return !1;
    let n = e.ranges.find((r) => r.from <= i && r.to >= i);
    return !n || n.field == e.active ? !1 : (t.dispatch({
      selection: Es(e.ranges, n.field),
      effects: li.of(e.ranges.some((r) => r.field > n.field) ? new Ee(e.ranges, n.field) : null)
    }), !0);
  }
}), ii = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
}, ce = /* @__PURE__ */ L.define({
  map(s, t) {
    let e = t.mapPos(s, -1, st.TrackAfter);
    return e ?? void 0;
  }
}), Ls = /* @__PURE__ */ new class extends de {
}();
Ls.startSide = 1;
Ls.endSide = -1;
const ga = /* @__PURE__ */ yt.define({
  create() {
    return W.empty;
  },
  update(s, t) {
    if (t.selection) {
      let e = t.state.doc.lineAt(t.selection.main.head).from, i = t.startState.doc.lineAt(t.startState.selection.main.head).from;
      e != t.changes.mapPos(i, -1) && (s = W.empty);
    }
    s = s.map(t.changes);
    for (let e of t.effects)
      e.is(ce) && (s = s.update({ add: [Ls.range(e.value, e.value + 1)] }));
    return s;
  }
});
function Td() {
  return [Ku, ga];
}
const Cn = "()[]{}<>";
function ma(s) {
  for (let t = 0; t < Cn.length; t += 2)
    if (Cn.charCodeAt(t) == s)
      return Cn.charAt(t + 1);
  return xo(s < 128 ? s : s + 1);
}
function ya(s, t) {
  return s.languageDataAt("closeBrackets", t)[0] || ii;
}
const ju = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), Ku = /* @__PURE__ */ P.inputHandler.of((s, t, e, i) => {
  if ((ju ? s.composing : s.compositionStarted) || s.state.readOnly)
    return !1;
  let n = s.state.selection.main;
  if (i.length > 2 || i.length == 2 && Dt(ot(i, 0)) == 1 || t != n.from || e != n.to)
    return !1;
  let r = Uu(s.state, i);
  return r ? (s.dispatch(r), !0) : !1;
}), $u = ({ state: s, dispatch: t }) => {
  if (s.readOnly)
    return !1;
  let i = ya(s, s.selection.main.head).brackets || ii.brackets, n = null, r = s.changeByRange((o) => {
    if (o.empty) {
      let l = Gu(s.doc, o.head);
      for (let a of i)
        if (a == l && rn(s.doc, o.head) == ma(ot(a, 0)))
          return {
            changes: { from: o.head - a.length, to: o.head + a.length },
            range: v.cursor(o.head - a.length)
          };
    }
    return { range: n = o };
  });
  return n || t(s.update(r, { scrollIntoView: !0, userEvent: "delete.backward" })), !n;
}, Pd = [
  { key: "Backspace", run: $u }
];
function Uu(s, t) {
  let e = ya(s, s.selection.main.head), i = e.brackets || ii.brackets;
  for (let n of i) {
    let r = ma(ot(n, 0));
    if (t == n)
      return r == n ? Yu(s, n, i.indexOf(n + n + n) > -1, e) : _u(s, n, r, e.before || ii.before);
    if (t == r && ba(s, s.selection.main.from))
      return Ju(s, n, r);
  }
  return null;
}
function ba(s, t) {
  let e = !1;
  return s.field(ga).between(0, s.doc.length, (i) => {
    i == t && (e = !0);
  }), e;
}
function rn(s, t) {
  let e = s.sliceString(t, t + 2);
  return e.slice(0, Dt(ot(e, 0)));
}
function Gu(s, t) {
  let e = s.sliceString(t - 2, t);
  return Dt(ot(e, 0)) == e.length ? e : e.slice(1);
}
function _u(s, t, e, i) {
  let n = null, r = s.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: t, from: o.from }, { insert: e, from: o.to }],
        effects: ce.of(o.to + t.length),
        range: v.range(o.anchor + t.length, o.head + t.length)
      };
    let l = rn(s.doc, o.head);
    return !l || /\s/.test(l) || i.indexOf(l) > -1 ? {
      changes: { insert: t + e, from: o.head },
      effects: ce.of(o.head + t.length),
      range: v.cursor(o.head + t.length)
    } : { range: n = o };
  });
  return n ? null : s.update(r, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Ju(s, t, e) {
  let i = null, n = s.changeByRange((r) => r.empty && rn(s.doc, r.head) == e ? {
    changes: { from: r.head, to: r.head + e.length, insert: e },
    range: v.cursor(r.head + e.length)
  } : i = { range: r });
  return i ? null : s.update(n, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Yu(s, t, e, i) {
  let n = i.stringPrefixes || ii.stringPrefixes, r = null, o = s.changeByRange((l) => {
    if (!l.empty)
      return {
        changes: [{ insert: t, from: l.from }, { insert: t, from: l.to }],
        effects: ce.of(l.to + t.length),
        range: v.range(l.anchor + t.length, l.head + t.length)
      };
    let a = l.head, h = rn(s.doc, a), f;
    if (h == t) {
      if (uo(s, a))
        return {
          changes: { insert: t + t, from: a },
          effects: ce.of(a + t.length),
          range: v.cursor(a + t.length)
        };
      if (ba(s, a)) {
        let u = e && s.sliceDoc(a, a + t.length * 3) == t + t + t ? t + t + t : t;
        return {
          changes: { from: a, to: a + u.length, insert: u },
          range: v.cursor(a + u.length)
        };
      }
    } else {
      if (e && s.sliceDoc(a - 2 * t.length, a) == t + t && (f = po(s, a - 2 * t.length, n)) > -1 && uo(s, f))
        return {
          changes: { insert: t + t + t + t, from: a },
          effects: ce.of(a + t.length),
          range: v.cursor(a + t.length)
        };
      if (s.charCategorizer(a)(h) != Ct.Word && po(s, a, n) > -1 && !Xu(s, a, t, n))
        return {
          changes: { insert: t + t, from: a },
          effects: ce.of(a + t.length),
          range: v.cursor(a + t.length)
        };
    }
    return { range: r = l };
  });
  return r ? null : s.update(o, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function uo(s, t) {
  let e = mt(s).resolveInner(t + 1);
  return e.parent && e.from == t;
}
function Xu(s, t, e, i) {
  let n = mt(s).resolveInner(t, -1), r = i.reduce((o, l) => Math.max(o, l.length), 0);
  for (let o = 0; o < 5; o++) {
    let l = s.sliceDoc(n.from, Math.min(n.to, n.from + e.length + r)), a = l.indexOf(e);
    if (!a || a > -1 && i.indexOf(l.slice(0, a)) > -1) {
      let f = n.firstChild;
      for (; f && f.from == n.from && f.to - f.from > e.length + a; ) {
        if (s.sliceDoc(f.to - e.length, f.to) == e)
          return !1;
        f = f.firstChild;
      }
      return !0;
    }
    let h = n.to == t && n.parent;
    if (!h)
      break;
    n = h;
  }
  return !1;
}
function po(s, t, e) {
  let i = s.charCategorizer(t);
  if (i(s.sliceDoc(t - 1, t)) != Ct.Word)
    return t;
  for (let n of e) {
    let r = t - n.length;
    if (s.sliceDoc(r, t) == n && i(s.sliceDoc(r - 1, r)) != Ct.Word)
      return r;
  }
  return -1;
}
function Bd(s = {}) {
  return [
    xt,
    pt.of(s),
    Bu,
    Zu,
    da
  ];
}
const Qu = [
  { key: "Ctrl-Space", run: Mu },
  { key: "Escape", run: Ou },
  { key: "ArrowDown", run: /* @__PURE__ */ Mi(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ Mi(!1) },
  { key: "PageDown", run: /* @__PURE__ */ Mi(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ Mi(!1, "page") },
  { key: "Enter", run: Au }
], Zu = /* @__PURE__ */ Be.highest(/* @__PURE__ */ ks.computeN([pt], (s) => s.facet(pt).defaultKeymap ? [Qu] : []));
export {
  I as $,
  ye as A,
  lt as B,
  Re as C,
  Xf as D,
  P as E,
  D as F,
  J as G,
  Z as H,
  G as I,
  jt as J,
  L as K,
  as as L,
  Ai as M,
  ql as N,
  ms as O,
  sc as P,
  Mc as Q,
  Ds as R,
  yt as S,
  Q as T,
  Be as U,
  fd as V,
  tt as W,
  Nr as X,
  ot as Y,
  Dt as Z,
  xo as _,
  gt as a,
  F as a0,
  pe as a1,
  Ct as a2,
  ed as a3,
  hd as a4,
  oe as a5,
  Pd as a6,
  kd as a7,
  Qu as a8,
  cd as a9,
  ud as aa,
  sd as ab,
  Sd as ac,
  id as ad,
  nd as ae,
  xd as af,
  Cd as ag,
  Md as ah,
  Td as ai,
  Bd as aj,
  ld as ak,
  ad as al,
  rd as am,
  ks as an,
  Ad as ao,
  sn as ap,
  od as aq,
  E as b,
  wd as c,
  vd as d,
  md as e,
  Fc as f,
  mt as g,
  dd as h,
  Tc as i,
  yd as j,
  bd as k,
  kc as l,
  vc as m,
  Od as n,
  cu as o,
  pd as p,
  v as q,
  Dd as r,
  mc as s,
  k as t,
  su as u,
  Jl as v,
  Dc as w,
  Oc as x,
  V as y,
  Vt as z
};
//# sourceMappingURL=index-8WxO2QXI.mjs.map
