
<template>
  <div class="racket-map-container">
    <div class="map-title">OGKILS欧击羽毛球拍打感分布</div>
    
    <div class="map-wrapper">
      <div class="map">
        <div class="scaled-content" :style="{ transform: `scale(${scale})` }">
          <div class="map-content">
            <div class="grid-lines">
              <div v-for="i in gridCount" :key="'h'+i" class="grid-line horizontal" :style="{ top: `${(i - 1) * (100/(gridCount-1))}%` }"></div>
              <div v-for="i in gridCount" :key="'v'+i" class="grid-line vertical" :style="{ left: `${(i - 1) * (100/(gridCount-1))}%` }"></div>
            </div>
            
            <div class="center-lines">
              <div class="center-line x"></div>
              <div class="center-line y"></div>
            </div>
          </div>
          
          <div class="frame">
            <div class="frame-oval"></div>
          </div>
          
          <div class="axis-labels">
            <div class="axis-label-left">
              <span>手感</span>
              <span>柔和</span>
            </div>
            <div class="axis-label-right">
              <span>手感</span>
              <span>扎实</span>
            </div>
            <div class="axis-label-top">头重</div>
            <div class="axis-label-bottom">头轻</div>
          </div>
        </div>
        
        <div class="rackets-layer" :style="{ transform: `scale(${scale})` }" @wheel="handleWheel">
          <div 
            v-for="racket in rackets" 
            :key="racket.id" 
            class="racket-marker"
            :style="{
              left: `${racket.x}%`,
              top: `${racket.y}%`,
              zIndex: hoveredRacketId === racket.id ? 100 : 1
            }"
            @mouseenter="hoveredRacketId = racket.id"
            @mouseleave="hoveredRacketId = null"
          >
            <div class="racket-circle" :class="{ 'white-bg': racket.color === '#FFFFFF', 'hovered': hoveredRacketId === racket.id }" :style="{ backgroundColor: racket.color, transform: `scale(${1/scale})` }">
              <span class="racket-name">{{ racket.name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="zoom-controls">
        <button class="zoom-btn" @click="zoomIn" title="放大">
          <span>+</span>
        </button>
        <div class="zoom-display">{{ currentScale }}%</div>
        <button class="zoom-btn" @click="zoomOut" title="缩小">
          <span>−</span>
        </button>
        <button class="zoom-btn reset-btn" @click="resetZoom" title="重置">
          <span>⟲</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { rackets } from '../config/rackets';

const scale = ref(1);
const minScale = 0.5;
const maxScale = 2;
const scaleStep = 0.1;
const hoveredRacketId = ref<string | null>(null);

const currentScale = computed(() => Math.round(scale.value * 100));

const gridCount = computed(() => {
  const baseCount = 10;
  const maxCount = 30;
  const normalizedScale = (scale.value - minScale) / (maxScale - minScale);
  return Math.round(baseCount + normalizedScale * (maxCount - baseCount));
});

const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value = Math.min(maxScale, scale.value + scaleStep);
  }
};

const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value = Math.max(minScale, scale.value - scaleStep);
  }
};

const resetZoom = () => {
  scale.value = 1;
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -scaleStep : scaleStep;
  scale.value = Math.max(minScale, Math.min(maxScale, scale.value + delta));
};
</script>


<style scoped>
.racket-map-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #00B5B8 0%, #009698 100%);
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.map-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.map-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.map {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding-bottom: 100%;
}

@media (min-width: 768px) {
  .map-wrapper {
    max-width: 700px;
  }
  .map {
    max-width: 600px;
  }
}

@media (min-width: 1024px) {
  .map-wrapper {
    max-width: 800px;
  }
  .map {
    max-width: 700px;
  }
}

.scaled-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.rackets-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.map-content {
  position: absolute;
  top: 3%;
  left: 5%;
  width: 90%;
  height: 85%;
  border-radius: 50%;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.grid-line.horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.grid-line.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}

.center-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.center-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
}

.center-line.x {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

.center-line.y {
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

.racket-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 3;
  transition: transform 0.2s ease;
}

.racket-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.racket-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.racket-circle.white-bg {
  border: 2px solid #ddd;
}

.racket-circle.hovered {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.racket-name {
  font-size: 11px;
  font-weight: bold;
  color: white;
  text-align: center;
  white-space: nowrap;
}

.white-bg .racket-name {
  color: #333;
}

.frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

.frame-oval {
  position: absolute;
  top: 2%;
  left: 3%;
  width: 94%;
  height: 87%;
  border: 4px solid white;
  border-radius: 50%;
}


.axis-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.axis-label-left {
  position: absolute;
  left: -70px;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.axis-label-left span:first-child {
  margin-bottom: 5px;
}

.axis-label-right {
  position: absolute;
  right: -70px;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.axis-label-right span:first-child {
  margin-bottom: 5px;
}

.axis-label-top {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.axis-label-bottom {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.zoom-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.zoom-btn:active {
  transform: scale(0.95);
}

.zoom-display {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding: 5px 0;
}

.reset-btn {
  font-size: 16px;
}
</style>
