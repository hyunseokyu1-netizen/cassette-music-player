import "./CassetteSpritePlayer.css";

type ControlState = "stopped" | "playing" | "fast-forward";

export function Preview() {
  const state = "playing" as ControlState;

  return (
    <div className="cassette-sprite-demo">
      <div className="cassette-sprite-panel">
        <div className="cassette-stage">
          <div className="cassette-body-frame">
            <div className="sprite cassette-body" />

            <div className="reel-overlay left">
              <div
                className={[
                  "sprite",
                  "reel-left",
                  "reel-spin",
                  state === "fast-forward" ? "fast" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>

            <div className="reel-overlay right">
              <div
                className={[
                  "sprite",
                  "reel-right",
                  "reel-spin",
                  state === "fast-forward" ? "fast" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>

            <div className="status-strip">
              <span className="side-chip">Side A</span>
              <span className="counter">03:45</span>
              <span className="play-chip">
                {state === "playing" ? "Playing" : "Stopped"}
              </span>
            </div>
          </div>

          <div className="button-grid">
            <div className="button-slot">
              <span className="button-label">Rewind</span>
              <button type="button" className="button-surface sprite btn-rewind" />
            </div>

            <div className="button-slot">
              <span className="button-label">Play</span>
              <button
                type="button"
                className={[
                  "button-surface",
                  "sprite",
                  state === "playing" ? "btn-play-active playing" : "btn-play",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>

            <div className="button-slot">
              <span className="button-label">Fast Forward</span>
              <button type="button" className="button-surface sprite btn-ff" />
            </div>

            <div className="button-slot">
              <span className="button-label">Playing</span>
              <button
                type="button"
                className="button-surface sprite btn-play-active playing"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;
