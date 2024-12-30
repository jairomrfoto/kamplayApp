import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1520095972714-909e91b038e5?auto=format&fit=crop&q=80',
    title: 'Aventuras inolvidables',
    description: 'Creamos momentos que durarán toda la vida'
  },
  {
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?auto=format&fit=crop&q=80',
    title: 'Aprendizaje divertido',
    description: 'Educación a través de la experiencia'
  },
  {
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?auto=format&fit=crop&q=80',
    title: 'Seguridad garantizada',
    description: 'Tu tranquilidad es nuestra prioridad'
  }
];

const Hero = () => {
  return (
    <div className="relative h-[600px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 transform scale-100 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 transform transition-all duration-500 translate-y-0 opacity-100">{slide.title}</h2>
                <p className="text-xl md:text-2xl transform transition-all duration-500 translate-y-0 opacity-100">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Hero;