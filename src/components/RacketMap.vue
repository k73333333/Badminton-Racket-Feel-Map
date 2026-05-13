
<template>
  <div class="racket-map-container">
    <div class="map-wrapper">
      <div class="map-title">{{ displayTitle }}</div>
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
            v-for="racket in filteredRackets" 
            :key="racket.id" 
            class="racket-marker"
            :style="{
              left: `${racket.x}%`,
              top: `${racket.y}%`,
              zIndex: hoveredRacketId === racket.id ? 100 : 1
            }"
            @mouseenter="hoveredRacketId = racket.id"
            @mouseleave="hoveredRacketId = null"
            @click="handleRacketClick(racket)"
          >
            <div class="racket-circle" :class="{ 'hovered': hoveredRacketId === racket.id, 'edit-mode': isEditMode }" :style="{ backgroundColor: racket.color, transform: `scale(${1/scale * (1 + (scale - 1) * 0.5)})` }">
              <span class="racket-name" :style="{ color: racket.fontColor }">{{ racket.name }}</span>
              <div v-if="isEditMode" class="delete-badge" @click.stop="deleteRacket(racket.id)">×</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="zoom-controls">
        <button class="zoom-btn edit-toggle-btn" :class="{ 'active': isEditMode }" @click="toggleEditMode" :title="isEditMode ? '退出编辑' : '进入编辑'">
          <span>{{ isEditMode ? '✓' : '✎' }}</span>
        </button>
        <button class="zoom-btn filter-toggle-btn" @click="showFilterModal = true" title="品牌筛选">
          <span>Y</span>
        </button>
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

      <!-- 编辑控制面板 -->
      <transition name="slide-fade">
        <div v-if="isEditMode" class="edit-panel">
          <div class="edit-panel-header">数据管理</div>
          <div class="edit-actions">
            <button class="action-btn add-btn" @click="openAddModal">新增球拍</button>
            <div class="action-group">
              <button class="action-btn" @click="exportJSON">导出 JSON</button>
              <label class="action-btn upload-label">
                导入 JSON
                <input type="file" accept=".json" @change="importJSON" style="display: none">
              </label>
            </div>
            <div class="action-group">
              <button class="action-btn" @click="exportExcel">导出表格</button>
              <label class="action-btn upload-label">
                导入表格
                <input type="file" accept=".xlsx,.xls,.csv" @change="importExcel" style="display: none">
              </label>
            </div>
            <div class="action-group">
              <button class="action-btn template-btn" @click="downloadJsonTemplate">下载 JSON 模板</button>
              <button class="action-btn template-btn" @click="downloadExcelTemplate">下载表格模板</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- 品牌筛选弹窗 -->
  <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
    <div class="modal-content filter-modal" @click.stop>
      <h3>综合筛选</h3>
      
      <div class="filter-group">
        <div class="filter-group-title">品牌 (多选)</div>
        <div class="brand-tags">
          <span 
            v-for="brand in allBrands" 
            :key="brand" 
            class="brand-tag"
            :class="{ active: selectedBrands.includes(brand) }"
            @click="toggleBrand(brand)"
          >
            {{ brand }}
          </span>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-group-title">手感范围 ({{ feelRange.min }} - {{ feelRange.max }})</div>
        <div class="range-labels">
          <span>柔和</span>
          <span>扎实</span>
        </div>
        <div class="dual-range">
          <input type="range" v-model.number="feelRange.min" min="0" max="100" step="1">
          <input type="range" v-model.number="feelRange.max" min="0" max="100" step="1">
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-group-title">拍头重量 ({{ weightRange.min }} - {{ weightRange.max }})</div>
        <div class="range-labels">
          <span>头重</span>
          <span>头轻</span>
        </div>
        <div class="dual-range">
          <input type="range" v-model.number="weightRange.min" min="0" max="100" step="1">
          <input type="range" v-model.number="weightRange.max" min="0" max="100" step="1">
        </div>
      </div>

      <div class="filter-footer">
        <button class="action-btn reset-filter-btn" @click="resetFilters">重置筛选</button>
        <button class="modal-close" @click="showFilterModal = false">完成</button>
      </div>
    </div>
  </div>

  <!-- 编辑/新增 弹窗 -->
  <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
    <div class="modal-content edit-modal" @click.stop>
      <h3>{{ editingRacket.id ? '编辑球拍' : '新增球拍' }}</h3>
      <form @submit.prevent="saveRacket" class="edit-form">
        <div class="form-row">
          <div class="form-item">
            <label>名称:</label>
            <input v-model="editingRacket.name" required placeholder="例如: LD-700">
          </div>
          <div class="form-item">
            <label>品牌:</label>
            <input v-model="editingRacket.brand" required placeholder="例如: OGKILS">
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>X (手感 0-100):</label>
            <input type="number" v-model.number="editingRacket.x" min="0" max="100" required>
          </div>
          <div class="form-item">
            <label>Y (重量 0-100):</label>
            <input type="number" v-model.number="editingRacket.y" min="0" max="100" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>背景颜色 (HEX):</label>
            <div class="color-input-wrapper">
              <input v-model="editingRacket.color" type="text" placeholder="#FFFFFF">
              <input v-model="editingRacket.color" type="color">
            </div>
          </div>
          <div class="form-item">
            <label>字体颜色 (HEX):</label>
            <div class="color-input-wrapper">
              <input v-model="editingRacket.fontColor" type="text" placeholder="#333333">
              <input v-model="editingRacket.fontColor" type="color">
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>详情链接 (URL):</label>
          <input v-model="editingRacket.url" placeholder="https://...">
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
          <button type="submit" class="save-btn">保存</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 跳转确认弹窗 -->
  <div v-if="showLinkConfirmModal" class="modal-overlay" @click="closeLinkConfirmModal">
    <div class="modal-content link-confirm-modal" @click.stop>
      <div class="confirm-icon">🔗</div>
      <h3>即将离开本页面</h3>
      <p>即将跳转到球拍【{{ targetRacketForLink?.name }}】的详细页面。</p>
      <div class="confirm-url">{{ targetRacketForLink?.url }}</div>
      <div class="confirm-actions">
        <button class="action-btn cancel-link-btn" @click="closeLinkConfirmModal">取消</button>
        <button class="action-btn confirm-link-btn" @click="confirmNavigation">立即跳转</button>
      </div>
    </div>
  </div>
  
  <div v-if="showModal" class="modal-overlay" @click="showModal = false">
    <div class="modal-content" @click.stop>
      <h3>关于这个项目</h3>
      <p>这是一个羽毛球拍打感分布图项目</p>
      <p>源码地址：<a href="https://github.com/k73333333/Badminton-Racket-Feel-Map" target="_blank">https://github.com/k73333333/Badminton-Racket-Feel-Map</a></p>
      <p>如有问题、建议或者其他需求，可以在 GitHub 上提交 Issue或者通过邮箱联系我：<a href="mailto:k73333333@qq.com">k73333333@qq.com</a>。如果你需要二次开发或者使用直接去源码地址Fork或者提个PR即可</p>
      <button class="modal-close" @click="showModal = false">关闭</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { rackets, type Racket } from '../config/rackets';
import * as XLSX from 'xlsx';

const scale = ref(1);
const minScale = 0.5;
const maxScale = 3;
const scaleStep = 0.1;
const hoveredRacketId = ref<string | null>(null);
const showModal = ref(false);
const showFilterModal = ref(false);
const showLinkConfirmModal = ref(false);
const targetRacketForLink = ref<Racket | null>(null);

const selectedBrands = ref<string[]>([]);
const feelRange = reactive({ min: 0, max: 100 });
const weightRange = reactive({ min: 0, max: 100 });

const allBrands = computed(() => {
  const brands = new Set(racketList.value.map(r => r.brand));
  return Array.from(brands).sort();
});

const filteredRackets = computed(() => {
  return racketList.value.filter(r => {
    const brandMatch = selectedBrands.value.length === 0 || selectedBrands.value.includes(r.brand);
    const feelMatch = r.x >= feelRange.min && r.x <= feelRange.max;
    const weightMatch = r.y >= weightRange.min && r.y <= weightRange.max;
    return brandMatch && feelMatch && weightMatch;
  });
});

const displayTitle = computed(() => {
  const brands = new Set(filteredRackets.value.map(r => r.brand));
  const brandNames = Array.from(brands).join('/');
  return brandNames ? `${brandNames}羽毛球拍打感分布` : '羽毛球拍打感分布';
});

const toggleBrand = (brand: string) => {
  const index = selectedBrands.value.indexOf(brand);
  if (index === -1) {
    selectedBrands.value.push(brand);
  } else {
    selectedBrands.value.splice(index, 1);
  }
};

const resetFilters = () => {
  selectedBrands.value = [];
  feelRange.min = 0;
  feelRange.max = 100;
  weightRange.min = 0;
  weightRange.max = 100;
};

const isEditMode = ref(false);
const racketList = ref<Racket[]>([...rackets]);
const showEditModal = ref(false);
const editingRacket = reactive<Partial<Racket>>({});

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const handleRacketClick = (racket: Racket) => {
  if (isEditMode.value) {
    Object.assign(editingRacket, JSON.parse(JSON.stringify(racket)));
    showEditModal.value = true;
  } else if (racket.url) {
    targetRacketForLink.value = racket;
    showLinkConfirmModal.value = true;
  }
};

const confirmNavigation = () => {
  if (targetRacketForLink.value?.url) {
    window.open(targetRacketForLink.value.url, '_blank');
  }
  closeLinkConfirmModal();
};

const closeLinkConfirmModal = () => {
  showLinkConfirmModal.value = false;
  targetRacketForLink.value = null;
};

const deleteRacket = (id: string) => {
  if (confirm('确定要删除这个球拍吗？')) {
    racketList.value = racketList.value.filter(r => r.id !== id);
  }
};

const openAddModal = () => {
  Object.keys(editingRacket).forEach(key => delete (editingRacket as any)[key]);
  Object.assign(editingRacket, {
    name: '',
    brand: '',
    x: 50,
    y: 50,
    color: '#FFFFFF',
    fontColor: '#333333',
    url: ''
  });
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const saveRacket = () => {
  if (editingRacket.id) {
    // Edit existing
    const index = racketList.value.findIndex(r => r.id === editingRacket.id);
    if (index !== -1) {
      racketList.value[index] = { ...editingRacket as Racket };
    }
  } else {
    // Add new
    const newId = (Math.max(0, ...racketList.value.map(r => parseInt(r.id))) + 1).toString();
    racketList.value.push({
      ...editingRacket as Racket,
      id: newId
    });
  }
  closeEditModal();
};

const exportJSON = () => {
  const dataStr = JSON.stringify(racketList.value, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = 'rackets.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const importJSON = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      if (Array.isArray(json)) {
        racketList.value = json;
        alert('导入成功！');
      } else {
        alert('JSON 格式错误：应为数组格式');
      }
    } catch (err) {
      alert('导入失败：解析 JSON 出错');
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = ''; // Reset input
};

const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(racketList.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rackets");
  XLSX.writeFile(workbook, "rackets.xlsx");
};

const importExcel = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<any>(worksheet);
      
      const validatedData: Racket[] = json.map((item, index) => ({
        id: item.id?.toString() || (Date.now() + index).toString(),
        name: item.name || '未知型号',
        brand: item.brand || '未知品牌',
        x: Number(item.x) || 50,
        y: Number(item.y) || 50,
        color: item.color || '#FFFFFF',
        fontColor: item.fontColor || '#333333',
        url: item.url || ''
      }));

      racketList.value = validatedData;
      alert('表格导入成功！');
    } catch (err) {
      alert('导入失败：解析表格出错');
    }
  };
  reader.readAsArrayBuffer(file);
  (event.target as HTMLInputElement).value = ''; // Reset input
};

const downloadJsonTemplate = () => {
  const template = [
    { id: '1', name: '示例球拍', brand: '示例品牌', x: 50, y: 50, color: '#FFFFFF', fontColor: '#333333', url: 'https://example.com' }
  ];
  const dataStr = JSON.stringify(template, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', 'racket_import_template.json');
  linkElement.click();
};

const downloadExcelTemplate = () => {
  const template = [
    { id: '1', name: '示例球拍', brand: '示例品牌', x: 50, y: 50, color: '#FFFFFF', fontColor: '#333333', url: 'https://example.com' }
  ];
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, "racket_import_template.xlsx");
};

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
    bottom: 0%;
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
    bottom: 0%;
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
  border: 0.02rem solid rgba(255, 255, 255, 0.2);
}

.racket-circle.hovered {
  box-shadow: 0 0.04rem 0.16rem rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.racket-name {
  font-size: 0.11rem;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
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
  bottom: 0%;
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

/* 编辑功能样式 */
.edit-toggle-btn.active {
  background: #FF4D4F;
}

.filter-toggle-btn {
  background: #00B5B8;
  color: white;
}

.filter-toggle-btn span {
  font-size: 0.14rem;
  font-weight: bold;
}

.edit-panel {
  position: fixed;
  left: 0.2rem;
  bottom: 0.2rem;
  width: 2.8rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.16rem;
  padding: 0.15rem;
  box-shadow: 0 0.04rem 0.2rem rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.edit-panel-header {
  font-size: 0.16rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.12rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.08rem;
}

.edit-actions {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.action-btn {
  width: 100%;
  padding: 0.08rem;
  border: none;
  border-radius: 0.08rem;
  background: #f5f5f5;
  color: #333;
  font-size: 0.13rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  opacity: 0.8;
}

.action-btn:hover {
  opacity: 1;
}

.add-btn {
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
  font-weight: bold;
}

.add-btn:hover {
  opacity: 0.9;
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
}

.action-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.08rem;
}

/* 品牌筛选弹窗样式 */
.filter-modal {
  width: 3.5rem;
  max-width: 90vw;
  padding: 0.2rem !important;
}

.filter-group {
  margin-bottom: 0.18rem;
}

.filter-group-title {
  font-size: 0.13rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.08rem;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.11rem;
  color: #999;
  margin-bottom: 0.04rem;
}

.dual-range {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.dual-range input[type="range"] {
  width: 100%;
  height: 0.04rem;
  background: #eee;
  border-radius: 0.02rem;
  outline: none;
  -webkit-appearance: none;
}

.dual-range input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0.14rem;
  height: 0.14rem;
  background: #00B5B8;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0.02rem 0.04rem rgba(0,0,0,0.1);
}

.brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.08rem;
}

.brand-tag {
  padding: 0.06rem 0.12rem;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 1rem;
  font-size: 0.12rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.brand-tag:hover {
  background: #e8e8e8;
}

.brand-tag.active {
  background: #00B5B8;
  color: white;
  border-color: #00B5B8;
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 0.15rem;
  margin-top: 0.1rem;
}

/* 跳转确认弹窗样式 */
.link-confirm-modal {
  width: 3.2rem;
  text-align: center;
  padding: 0.25rem !important;
}

.confirm-icon {
  font-size: 0.32rem;
  margin-bottom: 0.1rem;
}

.link-confirm-modal h3 {
  font-size: 0.18rem;
  margin-bottom: 0.12rem;
}

.link-confirm-modal p {
  font-size: 0.13rem;
  color: #666;
  margin-bottom: 0.08rem;
}

.confirm-url {
  font-size: 0.11rem;
  color: #999;
  background: #f9f9f9;
  padding: 0.06rem;
  border-radius: 0.04rem;
  word-break: break-all;
  margin-bottom: 0.2rem;
}

.confirm-actions {
  display: flex;
  gap: 0.1rem;
}

.confirm-link-btn {
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
  flex: 2;
}

.cancel-link-btn {
  background: #f5f5f5;
  color: #666;
  flex: 1;
}

.reset-filter-btn {
  background: #f5f5f5;
  color: #666;
  width: auto;
  padding: 0.06rem 0.12rem;
}

.reset-filter-btn:hover {
  background: #eee;
}

.modal-close {
  background: #fff;
  border: 1px dashed #00B5B8;
  color: #00B5B8;
}

.upload-label {
  display: block;
  margin: 0;
}

.delete-badge {
  position: absolute;
  top: -0.1rem;
  right: -0.1rem;
  width: 0.2rem;
  height: 0.2rem;
  background: #FF4D4F;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.14rem;
  font-weight: bold;
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.edit-mode {
  border: 0.02rem dashed #FF4D4F !important;
}

/* 弹窗表单样式 */
.edit-modal {
  width: 4rem;
  max-width: 90vw;
  text-align: left;
  padding: 0.15rem 0.2rem !important;
}

.edit-modal h3 {
  margin: 0 0 0.1rem 0 !important;
  padding: 0 !important;
  font-size: 0.18rem;
  line-height: 1;
}

.edit-form {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
}

.form-row {
  display: flex !important;
  gap: 0.12rem !important;
  margin: 0 0 0.08rem 0 !important;
  padding: 0 !important;
}

.form-row .form-item {
  flex: 1;
  margin: 0 !important;
}

.form-item {
  margin: 0 0 0.08rem 0 !important;
  padding: 0 !important;
  display: block !important;
}

.form-item label {
  display: block !important;
  font-size: 0.12rem !important;
  color: #666 !important;
  margin: 0 0 0.02rem 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
}

.form-item input {
  width: 100% !important;
  padding: 0.06rem 0.08rem !important;
  border: 1px solid #ddd !important;
  border-radius: 0.06rem !important;
  font-size: 0.13rem !important;
  margin: 0 !important;
  display: block !important;
  height: auto !important;
}

.color-input-wrapper {
  display: flex;
  gap: 0.08rem;
}

.color-input-wrapper input[type="color"] {
  width: 0.35rem;
  padding: 0 !important;
  height: 0.3rem;
}

.form-actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 0.08rem !important;
  margin: 0.15rem 0 0 0 !important;
  padding: 0 !important;
}

.cancel-btn, .save-btn {
  padding: 0.06rem 0.16rem;
  border-radius: 0.06rem;
  border: none;
  cursor: pointer;
  font-size: 0.13rem;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn {
  background: linear-gradient(135deg, #00B5B8 0%, #009698 100%);
  color: white;
}

/* 动画 */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(-0.2rem);
  opacity: 0;
}

@media (max-width: 750px) {
  .edit-panel {
    width: auto;
    left: 0.2rem;
    right: 0.2rem;
    bottom: 0.2rem;
  }
  .edit-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .action-btn {
    flex: 1;
    min-width: 1.2rem;
    font-size: 0.15rem;
  }

  /* 移动端弹窗整体加大 */
  .modal-content {
    width: 92% !important;
    max-width: none !important;
    padding: 0.35rem 0.3rem !important; /* 增加内边距 */
    border-radius: 0.24rem !important; /* 圆角也相应加大 */
  }

  .modal-content h3 {
    font-size: 0.26rem !important; /* 标题更大 */
    margin-bottom: 0.2rem !important;
  }

  .edit-form {
    gap: 0.18rem !important; /* 增加表单项之间的间距 */
  }

  .form-row {
    gap: 0.2rem !important; /* 增加行内间距 */
    margin-bottom: 0.15rem !important;
  }

  .form-item {
    gap: 0.08rem !important; /* 标签和输入框之间间距加大 */
  }

  .form-item label {
    font-size: 0.16rem !important;
  }

  .form-item input {
    font-size: 0.18rem !important;
    padding: 0.14rem 0.16rem !important; /* 输入框更高更宽 */
    border-radius: 0.1rem !important;
  }

  .brand-tag {
    font-size: 0.16rem !important;
    padding: 0.1rem 0.2rem !important;
    border-radius: 2rem !important;
  }

  .filter-group {
    margin-bottom: 0.25rem !important;
  }

  .filter-group-title {
    font-size: 0.18rem !important;
    margin-bottom: 0.12rem !important;
  }

  .range-labels {
    font-size: 0.14rem !important;
  }

  .link-confirm-modal {
    width: 85% !important; /* 跳转确认弹窗也相应调整比例 */
  }

  .confirm-icon {
    font-size: 0.45rem !important;
    margin-bottom: 0.15rem !important;
  }

  .link-confirm-modal p {
    font-size: 0.18rem !important;
    line-height: 1.5 !important;
  }

  .confirm-url {
    font-size: 0.14rem !important;
    padding: 0.1rem !important;
    margin-bottom: 0.3rem !important;
  }

  .form-actions, .filter-footer, .confirm-actions {
    margin-top: 0.3rem !important;
    gap: 0.15rem !important;
  }

  .cancel-btn, .save-btn, .modal-close, .confirm-link-btn, .cancel-link-btn {
    font-size: 0.18rem !important;
    padding: 0.12rem 0.25rem !important; /* 按钮整体更大 */
    border-radius: 0.12rem !important;
    min-height: 0.45rem; /* 确保最小高度方便点击 */
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
