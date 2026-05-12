
<template>
  <div class="racket-map-container">
    <div class="map-wrapper">
      <div class="map-title">OGKILS欧击羽毛球拍打感分布</div>
      <div class="map" @mousedown="handleMouseDown">
        <div class="scaled-content" :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }">
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
        
        <div class="rackets-layer" :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }" @wheel="handleWheel" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
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
            <div class="racket-circle" :class="{ 'white-bg': racket.color === '#FFFFFF', 'hovered': hoveredRacketId === racket.id }" :style="{ backgroundColor: racket.color, transform: `scale(${1/scale * (1 + (scale - 1) * 0.5)})` }">
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
        <button class="zoom-btn info-btn" @click="showSecretMessage" title="关于">
          <span>i</span>
        </button>
      </div>
    </div>
  </div>
  
  <div v-if="showModal" class="modal-overlay" @click="showModal = false">
    <div class="modal-content" @click.stop>
      <h3>关于这个项目</h3>
      <p>这是一个羽毛球拍打感分布图项目</p>
      <p>源码地址：<a href="https://github.com/k73333333/Badminton-Racket-Feel-Map" target="_blank">https://github.com/k73333333/Badminton-Racket-Feel-Map</a></p>
      <p>如有问题或建议，可以在 GitHub 上提交 Issue，或者直接联系我。如果你需要二次开发或者使用直接去源码地址Fork或者提个PR即可</p>
      <button class="modal-close" @click="showModal = false">关闭</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { rackets } from '../config/rackets';

const scale = ref(1);
const minScale = 0.5;
const maxScale = 3;
const scaleStep = 0.1;
const hoveredRacketId = ref<string | null>(null);
const showModal = ref(false);

const translateX = ref(0);
const translateY = ref(0);

let touchStartDistance = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTranslateX = 0;
let touchStartTranslateY = 0;
let isDragging = false;

const handleDragStart = (clientX: number, clientY: number) => {
  isDragging = true;
  touchStartX = clientX;
  touchStartY = clientY;
  touchStartTranslateX = translateX.value;
  touchStartTranslateY = translateY.value;
};

const handleDragMove = (clientX: number, clientY: number) => {
  if (isDragging) {
    const deltaX = clientX - touchStartX;
    const deltaY = clientY - touchStartY;
    translateX.value = touchStartTranslateX + deltaX;
    translateY.value = touchStartTranslateY + deltaY;
  }
};

const handleDragEnd = () => {
  touchStartDistance = 0;
  isDragging = false;
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    handleDragStart(event.touches[0].clientX, event.touches[0].clientY);
  } else if (event.touches.length === 2) {
    isDragging = false;
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    touchStartDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 1 && isDragging) {
    event.preventDefault();
    handleDragMove(event.touches[0].clientX, event.touches[0].clientY);
  } else if (event.touches.length === 2 && touchStartDistance > 0) {
    event.preventDefault();
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    const delta = (currentDistance - touchStartDistance) * 0.002;
    scale.value = Math.max(minScale, Math.min(maxScale, scale.value + delta));
    touchStartDistance = currentDistance;
  }
};

const handleTouchEnd = () => {
  handleDragEnd();
};

const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    handleDragStart(event.clientX, event.clientY);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
};

const handleMouseMove = (event: MouseEvent) => {
  handleDragMove(event.clientX, event.clientY);
};

const handleMouseUp = () => {
  handleDragEnd();
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const showSecretMessage = () => {
  showModal.value = true;
};

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
  translateX.value = 0;
  translateY.value = 0;
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -scaleStep : scaleStep;
  scale.value = Math.max(minScale, Math.min(maxScale, scale.value + delta));
};
</script>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

::-webkit-scrollbar-track {
  display: none;
}

::-webkit-scrollbar-thumb {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<style scoped>
.racket-map-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #00B5B8 0%, #009698 100%);
  padding: 0.2rem;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.map-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  text-align: center;
  font-size: 0.24rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  position: fixed;
  left: 0.2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.map-wrapper {
  position: relative;
  width: 100%;
  max-width: 6rem;
  margin-left: 1rem;
}

.map {
  position: relative;
  width: 100%;
  max-width: 5rem;
  padding-bottom: 100%;
  cursor: grab;
}

.map:active {
  cursor: grabbing;
}

.modal-content {
  background: white;
  border-radius: 0.2rem;
  padding: 0.4rem;
  max-width: 80%;
  max-height: 80%;
  text-align: center;
  animation: slideUp 0.3s ease;
  word-break: break-all;
  word-wrap: break-word;
}

.modal-content h3 {
  margin: 0 0 0.2rem 0;
  color: #333;
  font-size: 0.24rem;
}

.modal-content p {
  margin: 0.1rem 0;
  color: #666;
  font-size: 0.16rem;
  line-height: 1.5;
}

.modal-content a {
  color: #00B5B8;
  text-decoration: none;
}

.modal-content a:hover {
  text-decoration: underline;
}

.modal-close {
  margin-top: 0.3rem;
  padding: 0.1rem 0.3rem;
  border: none;
  border-radius: 0.08rem;
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
  font-size: 0.16rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  transform: scale(1.05);
}

@media (max-width: 750px) and (orientation: portrait) {
  .racket-map-container {
    padding: 0.2rem;
    padding-top: 1.6rem;
  }
  
  .map-title {
    writing-mode: horizontal-tb;
    text-orientation: mixed;
    position: fixed;
    left: 50%;
    top: 0.3rem;
    transform: translateX(-50%);
    font-size: 0.36rem;
    margin-bottom: 0.3rem;
    order: -1;
  }
  
  .map-wrapper {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 0;
  }
  
  .map {
    max-width: 6.4rem;
  }
  
  .racket-circle {
    width: 1.1rem;
    height: 1.1rem;
  }
  
  .racket-name {
    font-size: 0.22rem;
  }
  
  .axis-label-left,
  .axis-label-right {
    display: none;
  }
  
  .axis-label-top {
    font-size: 0.28rem;
    top: -0.6rem;
  }
  
  .axis-label-bottom {
    font-size: 0.28rem;
    bottom: 12%;
  }
  
  .zoom-controls {
    top: 1.2rem;
    right: 0.2rem;
    padding: 0.16rem;
  }
  
  .zoom-btn {
    width: 0.7rem;
    height: 0.7rem;
    font-size: 0.32rem;
  }
  
  .zoom-display {
    font-size: 0.24rem;
    padding: 0.08rem 0.16rem;
  }
  
  .frame-oval {
    border-width: 0.06rem;
  }
  
  .modal-content {
    padding: 0.6rem;
    max-width: 90%;
    max-height: 90%;
  }
  
  .modal-content h3 {
    font-size: 0.5rem;
    margin-bottom: 0.45rem;
  }
  
  .modal-content p {
    font-size: 0.33rem;
    margin: 0.3rem 0;
    line-height: 1.7;
  }
  
  .modal-close {
    font-size: 0.33rem;
    padding: 0.18rem 0.5rem;
    margin-top: 0.45rem;
  }
}

@media (max-width: 750px) and (orientation: landscape) {
  .racket-map-container {
    padding: 0.2rem;
  }
  
  .map-title {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    position: fixed;
    left: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.32rem;
  }
  
  .map-wrapper {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1.2rem;
  }
  
  .map {
    max-width: 6.4rem;
  }
  
  .racket-circle {
    width: 1.1rem;
    height: 1.1rem;
  }
  
  .racket-name {
    font-size: 0.22rem;
  }
  
  .axis-label-left,
  .axis-label-right {
    display: none;
  }
  
  .axis-label-top {
    font-size: 0.28rem;
    top: -0.6rem;
  }
  
  .axis-label-bottom {
    font-size: 0.28rem;
    bottom: 12%;
  }
  
  .zoom-controls {
    top: 0.2rem;
    right: 0.2rem;
    padding: 0.16rem;
  }
  
  .zoom-btn {
    width: 0.7rem;
    height: 0.7rem;
    font-size: 0.32rem;
  }
  
  .zoom-display {
    font-size: 0.24rem;
    padding: 0.08rem 0.16rem;
  }
  
  .frame-oval {
    border-width: 0.06rem;
  }
  
  .modal-content {
    padding: 0.6rem;
    max-width: 90%;
    max-height: 90%;
  }
  
  .modal-content h3 {
    font-size: 0.5rem;
    margin-bottom: 0.45rem;
  }
  
  .modal-content p {
    font-size: 0.33rem;
    margin: 0.3rem 0;
    line-height: 1.7;
  }
  
  .modal-close {
    font-size: 0.33rem;
    padding: 0.18rem 0.5rem;
    margin-top: 0.45rem;
  }
}

@media (min-width: 768px) {
  .map-wrapper {
    max-width: 7rem;
  }
  .map {
    max-width: 6rem;
  }
}

@media (min-width: 1024px) {
  .map-wrapper {
    max-width: 8rem;
  }
  .map {
    max-width: 7rem;
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
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.3);
}

.racket-circle.white-bg {
  border: 0.02rem solid #ddd;
}

.racket-circle.hovered {
  box-shadow: 0 0.04rem 0.16rem rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.racket-name {
  font-size: 0.11rem;
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
  border: 0.04rem solid white;
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
  left: -0.7rem;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 0.16rem;
  font-weight: bold;
  text-align: center;
}

.axis-label-left span:first-child {
  margin-bottom: 0.05rem;
}

.axis-label-right {
  position: absolute;
  right: -0.7rem;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 0.16rem;
  font-weight: bold;
  text-align: center;
}

.axis-label-right span:first-child {
  margin-bottom: 0.05rem;
}

.axis-label-top {
  position: absolute;
  top: -0.4rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.18rem;
  font-weight: bold;
}

.axis-label-bottom {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.18rem;
  font-weight: bold;
}

.zoom-controls {
  position: fixed;
  top: 0.2rem;
  right: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.12rem;
  padding: 0.1rem;
  box-shadow: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.zoom-btn {
  width: 0.4rem;
  height: 0.4rem;
  border: none;
  border-radius: 0.08rem;
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
  font-size: 0.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.3);
}

.zoom-btn:active {
  transform: scale(0.95);
}

.zoom-display {
  text-align: center;
  font-size: 0.14rem;
  font-weight: bold;
  color: #333;
  padding: 0.05rem 0;
}

.reset-btn {
  font-size: 0.16rem;
}

.info-btn {
  font-size: 0.16rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}



@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(0.2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
