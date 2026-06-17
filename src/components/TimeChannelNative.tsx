"use client";

import { useEffect } from "react";
import Link from "next/link";

export function TimeChannelNative() {
  useEffect(() => {
    void import("@/timechannel/native/main.js");
  }, []);

  return (
    <main className="timechannel-page" data-locale="zh">
      <canvas id="canvas" />

      <div id="title">
        <h1>MIAO WORKS</h1>
        <p>AI images / visual worlds / time channel</p>
      </div>

      <div id="toolbar">
        <Link className="btn" href="/#works">
          Home
        </Link>
        <button className="btn" id="btnUpload" type="button">
          Works
        </button>
        <button className="btn active" id="btnCruise" type="button">
          Auto Cruise
        </button>
        <button className="btn" id="btnSky" type="button">
          Color
        </button>
      </div>

      <div id="skyPanel">
        <div className="swatch active" data-sky="aurora" title="Aurora" style={{ background: "linear-gradient(135deg,#061007,#b7ff25)" }} />
        <div className="swatch" data-sky="ocean" title="Ocean" style={{ background: "linear-gradient(135deg,#06172a,#33d5ff)" }} />
        <div className="swatch" data-sky="ember" title="Ember" style={{ background: "linear-gradient(135deg,#150807,#ff4a24)" }} />
        <div className="swatch" data-sky="lavender" title="Lavender" style={{ background: "linear-gradient(135deg,#211831,#9f8cff)" }} />
        <div className="swatch" data-sky="rose" title="Rose" style={{ background: "linear-gradient(135deg,#2a0b18,#ff6f91)" }} />
        <div className="swatch" data-sky="rainbow" title="Rainbow" style={{ background: "conic-gradient(#b7ff25,#33d5ff,#ff4a24,#b7ff25)" }} />
      </div>

      <div id="uploadPanel">
        <button className="up-opt" id="optFiles" type="button">
          Add photos
        </button>
        <button className="up-opt" id="optFolder" type="button">
          Add folder
        </button>
      </div>
      <input type="file" id="fileInput" accept="image/*,.heic,.heif" multiple hidden />
      <input type="file" id="dirInput" multiple hidden />
      <div id="toast" />

      <div id="hint">
        <div className="scroll-icon" />
        scroll / drag / swipe to travel · click a photo to inspect
      </div>

      <div id="depth">
        <div className="num" id="depthNum">
          Miao
        </div>
        <div className="label" id="depthLabel">
          into the archive
        </div>
      </div>

      <div id="tip" />

      <div id="focusInfo">
        <button className="nav" id="prevBtn" type="button" aria-label="previous">
          Prev
        </button>
        <div className="meta">
          <div className="fdate" id="focusDate" />
          <div className="fhint">wheel or arrows to browse · click to return</div>
        </div>
        <button className="nav" id="nextBtn" type="button" aria-label="next">
          Next
        </button>
      </div>

      <div id="storyPanel">
        <div className="sp-head">WORK NOTE</div>
        <div className="sp-list" id="storyList" />
        <div className="sp-input">
          <textarea id="storyText" rows={2} placeholder="write a note for this work" />
          <button id="storyAdd" type="button" aria-label="add">
            Add
          </button>
        </div>
      </div>

      <div id="timeline">
        <div className="years" id="tlYears" />
        <div className="track" id="tlTrack">
          <div className="knob" id="tlKnob" />
        </div>
      </div>

      <div id="dropzone">drop images into the channel</div>

      <div id="loader">
        <div className="ring" />
        <div className="text">opening Miao works</div>
      </div>
    </main>
  );
}
