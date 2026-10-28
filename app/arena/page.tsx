import Quiz from "@/components/Quiz";

export default function Arena() {
  return (
    <div className="w-arena">
      <section className="hero container">
        <span className="eyebrow">Boss level · Detective Arena</span>
        <h1>Find the <span className="grad">token leak</span>.</h1>
        <p className="lead">33 crime scenes across every world and a dozen industries. Each one hides a costly mistake. Play them all or pick one world, spot the leak, earn 30 XP, and get your detective rank — plus a review of every leak you missed.</p>
      </section>
      <section className="container section" style={{ paddingTop: 0, maxWidth: 860 }}>
        <Quiz />
      </section>
    </div>
  );
}
