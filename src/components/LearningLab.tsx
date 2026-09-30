import { useState } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
export default function LearningLab({ type }: { type: 'gradient' | 'sigmoid' | 'vectors' }) {
  const [rate, setRate] = useState(0.1),
    [theta, setTheta] = useState(3),
    [step, setStep] = useState(0),
    [score, setScore] = useState(0),
    [angle, setAngle] = useState(45);
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  const points = Array.from({ length: 101 }, (_, i) => {
    const x = -4 + i * 0.08;
    return `${25 + i * 3.5},${type === 'gradient' ? 195 - x * x * 10 : 195 - sigmoid(x) * 170}`;
  }).join(' ');
  const x = type === 'gradient' ? theta : score;
  const y = type === 'gradient' ? theta * theta : sigmoid(score);
  return (
    <section className="learning-lab">
      <div className="lab-header">
        <span className="eyebrow">THE IDEA, IN MOTION</span>
        <span className="tag">Interactive lab</span>
      </div>
      {type === 'vectors' ? (
        <>
          <h3>Same length. Different direction.</h3>
          <p>Rotate a unit vector. Its dot product with (1, 0) is its horizontal projection.</p>
          <svg
            viewBox="0 0 400 220"
            role="img"
            aria-label={`Unit vector at ${angle} degrees; cosine similarity ${Math.cos((angle * Math.PI) / 180).toFixed(2)}`}
          >
            <line x1="65" y1="110" x2="335" y2="110" className="lab-axis" />
            <line x1="200" y1="10" x2="200" y2="210" className="lab-axis" />
            <circle
              cx="200"
              cy="110"
              r="90"
              fill="none"
              className="lab-axis"
              strokeDasharray="3 4"
            />
            <line x1="200" y1="110" x2="290" y2="110" stroke="var(--green)" strokeWidth="3" />
            <line
              x1="200"
              y1="110"
              x2={200 + 90 * Math.cos((angle * Math.PI) / 180)}
              y2={110 - 90 * Math.sin((angle * Math.PI) / 180)}
              stroke="var(--accent)"
              strokeWidth="3"
            />
            <circle
              cx={200 + 90 * Math.cos((angle * Math.PI) / 180)}
              cy={110 - 90 * Math.sin((angle * Math.PI) / 180)}
              r="5"
              fill="var(--accent)"
            />
          </svg>
          <label className="lab-control">
            Angle: {angle}°
            <input
              type="range"
              min="0"
              max="180"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
            />
          </label>
          <div className="lab-result">
            Cosine similarity: <strong>{Math.cos((angle * Math.PI) / 180).toFixed(3)}</strong>
          </div>
        </>
      ) : (
        <>
          <h3>
            {type === 'gradient'
              ? 'Take a step down the loss curve.'
              : 'From a raw score to a probability.'}
          </h3>
          <p>
            {type === 'gradient'
              ? 'Change the learning rate, then watch how each step changes θ².'
              : 'Move the score to see the sigmoid bend. A score of zero is exactly 50%.'}
          </p>
          <svg
            viewBox="0 0 400 220"
            role="img"
            aria-label={
              type === 'gradient'
                ? `Quadratic loss curve, theta ${theta.toFixed(2)}, loss ${y.toFixed(2)}`
                : `Sigmoid curve, score ${score}, probability ${y.toFixed(2)}`
            }
          >
            <line x1="25" y1="195" x2="380" y2="195" className="lab-axis" />
            <line x1="200" y1="15" x2="200" y2="200" className="lab-axis" />
            <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
            <circle
              cx={25 + (Math.max(-4, Math.min(4, x)) + 4) * 43.75}
              cy={Math.max(15, 195 - y * (type === 'gradient' ? 10 : 170))}
              r="6"
              fill="var(--green)"
            />
            <text x="25" y="215">
              −4
            </text>
            <text x="197" y="215">
              0
            </text>
            <text x="368" y="215">
              4
            </text>
          </svg>
          {type === 'gradient' ? (
            <>
              <label className="lab-control">
                Learning rate η: {rate.toFixed(2)}
                <input
                  type="range"
                  min="0.01"
                  max="1.1"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </label>
              <div className="lab-result" aria-live="polite">
                Step {step} · θ = {theta.toFixed(3)} · Loss = {(theta * theta).toFixed(3)}
                {Math.abs(theta) > 4 && <span> — outside the displayed plot</span>}
              </div>
              <div className="inline-actions">
                <button
                  className="button"
                  disabled={Math.abs(theta) > 1e6}
                  onClick={() => {
                    setTheta(theta - rate * 2 * theta);
                    setStep(step + 1);
                  }}
                >
                  Take a step <ArrowRight size={13} />
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setTheta(3);
                    setStep(0);
                  }}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="lab-control">
                Linear score z: {score.toFixed(1)}
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                />
              </label>
              <div className="lab-result" aria-live="polite">
                Probability: <strong>{(100 * sigmoid(score)).toFixed(1)}%</strong> · Positive-label
                loss: {(-Math.log(sigmoid(score))).toFixed(3)}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
