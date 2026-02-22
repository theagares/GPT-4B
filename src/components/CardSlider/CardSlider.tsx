import { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { BusinessCard } from "../../store/cardStore";

type CardSliderProps = {
  cards: BusinessCard[];
  onCardClick?: (card: BusinessCard) => void;
};

const CardSlider = ({ cards, onCardClick }: CardSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1.15, spacing: 16 },
    rubberband: true,
    mode: "free-snap",
    slideChanged(instance) {
      setCurrentSlide(instance.track.details.rel);
    },
  });

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-100 p-6 text-center text-sm text-gray-500">
        등록된 프로필이 없습니다. OCR로 첫 프로필을 추가해 보세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={sliderRef} className="keen-slider">
        {cards.map((card) => (
          <article
            key={card.id}
            className="keen-slider__slide select-none"
            onClick={() => onCardClick?.(card)}
          >
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-glass">
              <p className="text-sm text-white/70">{card.company}</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{card.name}</h3>
                  <p className="text-sm text-white/70">{card.position}</p>
                </div>
                <div className="text-right text-xs text-white/60">
                  <p>{card.phone}</p>
                  <p>{card.email}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {slider && (
        <div className="flex justify-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                currentSlide === index ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => slider.current?.moveToIdx(index)}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardSlider;

