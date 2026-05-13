/**
 * 羽毛球拍数据配置接口
 * @interface Racket
 * @property {string} id - 球拍唯一标识
 * @property {string} name - 球拍名称
 * @property {string} brand - 品牌名称
 * @property {number} x - 在坐标系中的水平位置（0-100）
 * @property {number} y - 在坐标系中的垂直位置（0-100）
 * @property {string} color - 球拍标记背景颜色（十六进制）
 * @property {string} fontColor - 球拍名称字体颜色（十六进制）
 * @property {string} [url] - 球拍详情链接（可选）
 * 
 * @description 坐标系说明：
 * - 水平轴（X轴）：从左到右，手感从柔和到扎实
 * - 垂直轴（Y轴）：从上到下，拍头从重到轻
 * - 每个球拍根据其特性被放置在相应位置
 */
export interface Racket {
  id: string;
  name: string;
  brand: string;
  x: number;
  y: number;
  color: string;
  fontColor: string;
  url?: string;
}

/**
 * 球拍数据配置说明：
 * 
 * 数据结构：
 * - id: 唯一标识符，用于区分不同球拍
 * - name: 球拍名称，显示在标记上
 * - brand: 品牌名称
 * - x: 水平位置，范围 0-100，对应手感从柔和(左)到扎实(右)
 * - y: 垂直位置，范围 0-100，对应拍头从重(上)到轻(下)
 * - color: 标记背景颜色，使用十六进制颜色值
 * - fontColor: 字体颜色，使用十六进制颜色值
 * - url: 球拍详情链接，可选字段
 * 
 * 添加新球拍：
 * 1. 在数组末尾添加新对象
 * 2. 确保 id 唯一且连续
 * 3. 根据球拍特性设置 x/y 位置
 * 4. 选择合适的背景色和字体色
 */
export const rackets: Racket[] = [
  {
    id: '1',
    name: '火之呼吸',
    brand: 'OGKILS',
    x: 40,
    y: 25,
    color: '#C41E3A',
    fontColor: '#FFFFFF',
    url: '123'
  },
  {
    id: '2',
    name: 'LD-100ZZ',
    brand: 'OGKILS',
    x: 51,
    y: 22,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '3',
    name: 'LD-99',
    brand: 'OGKILS',
    x: 62,
    y: 18,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '4',
    name: 'LD-88S',
    brand: 'OGKILS',
    x: 65,
    y: 21,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '5',
    name: '蛇之呼吸',
    brand: 'OGKILS',
    x: 45,
    y: 28,
    color: '#5B2C6F',
    fontColor: '#FFFFFF'
  },
  {
    id: '6',
    name: 'LD-LYD',
    brand: 'OGKILS',
    x: 28,
    y: 31,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '7',
    name: '水之呼吸',
    brand: 'OGKILS',
    x: 35,
    y: 38,
    color: '#3498DB',
    fontColor: '#FFFFFF'
  },
  {
    id: '8',
    name: '霞之呼吸',
    brand: 'OGKILS',
    x: 50,
    y: 41,
    color: '#1E8449',
    fontColor: '#FFFFFF'
  },
  {
    id: '9',
    name: 'LD-1000Z',
    brand: 'OGKILS',
    x: 60,
    y: 38,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '10',
    name: '雷之呼吸',
    brand: 'OGKILS',
    x: 72,
    y: 38,
    color: '#1B4F72',
    fontColor: '#FFFFFF'
  },
  {
    id: '11',
    name: 'LD-12',
    brand: 'OGKILS',
    x: 32,
    y: 46,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '12',
    name: '风之呼吸',
    brand: 'OGKILS',
    x: 62,
    y: 51,
    color: '#27AE60',
    fontColor: '#FFFFFF'
  },
  {
    id: '13',
    name: '恋之呼吸',
    brand: 'OGKILS',
    x: 22,
    y: 51,
    color: '#E91E63',
    fontColor: '#FFFFFF'
  },
  {
    id: '14',
    name: 'LD-800P',
    brand: 'OGKILS',
    x: 42,
    y: 54,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '15',
    name: 'LD-700',
    brand: 'OGKILS',
    x: 40,
    y: 64,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '16',
    name: 'LD-800LT',
    brand: 'OGKILS',
    x: 75,
    y: 56,
    color: '#FFFFFF',
    fontColor: '#333333'
  },
  {
    id: '17',
    name: 'LD-77P',
    brand: 'OGKILS',
    x: 55,
    y: 34,
    color: '#FFFFFF',
    fontColor: '#333333'
  }
];
