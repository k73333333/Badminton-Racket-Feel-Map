/**
 * 羽毛球拍数据配置接口
 * @interface Racket
 * @property {string} id - 球拍唯一标识
 * @property {string} name - 球拍名称
 * @property {string} brand - 品牌名称
 * @property {number} x - 在坐标系中的水平位置（0-100）
 * @property {number} y - 在坐标系中的垂直位置（0-100）
 * @property {string} color - 球拍标记颜色（十六进制）
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
 * - color: 标记颜色，使用十六进制颜色值
 * 
 * 添加新球拍：
 * 1. 在数组末尾添加新对象
 * 2. 确保 id 唯一且连续
 * 3. 根据球拍特性设置 x/y 位置
 * 4. 选择合适的颜色
 * 
 * 示例：
 * {
 *   id: '18',
 *   name: '新球拍',
 *   brand: 'OGKILS',
 *   x: 50,
 *   y: 50,
 *   color: '#FF5733'
 * }
 */
export const rackets: Racket[] = [
  {
    id: '1',
    name: '火之呼吸',
    brand: 'OGKILS',
    x: 40,
    y: 25,
    color: '#C41E3A'
  },
  {
    id: '2',
    name: 'D-100ZZ',
    brand: 'OGKILS',
    x: 51,
    y: 22,
    color: '#FFFFFF'
  },
  {
    id: '3',
    name: 'LD-99',
    brand: 'OGKILS',
    x: 62,
    y: 18,
    color: '#FFFFFF'
  },
  {
    id: '4',
    name: 'LD-88S',
    brand: 'OGKILS',
    x: 65,
    y: 21,
    color: '#FFFFFF'
  },
  {
    id: '5',
    name: '蛇之呼吸',
    brand: 'OGKILS',
    x: 45,
    y: 28,
    color: '#5B2C6F'
  },
  {
    id: '6',
    name: 'LD-LYD',
    brand: 'OGKILS',
    x: 28,
    y: 31,
    color: '#FFFFFF'
  },
  {
    id: '7',
    name: '水之呼吸',
    brand: 'OGKILS',
    x: 35,
    y: 38,
    color: '#3498DB'
  },
  {
    id: '8',
    name: '霞之呼吸',
    brand: 'OGKILS',
    x: 50,
    y: 41,
    color: '#1E8449'
  },
  {
    id: '9',
    name: 'LD-1000Z',
    brand: 'OGKILS',
    x: 60,
    y: 38,
    color: '#FFFFFF'
  },
  {
    id: '10',
    name: '雷之呼吸',
    brand: 'OGKILS',
    x: 72,
    y: 38,
    color: '#1B4F72'
  },
  {
    id: '11',
    name: 'LD-12',
    brand: 'OGKILS',
    x: 32,
    y: 46,
    color: '#FFFFFF'
  },
  {
    id: '12',
    name: '风之呼吸',
    brand: 'OGKILS',
    x: 62,
    y: 51,
    color: '#27AE60'
  },
  {
    id: '13',
    name: '恋之呼吸',
    brand: 'OGKILS',
    x: 22,
    y: 51,
    color: '#E91E63'
  },
  {
    id: '14',
    name: 'LD-800P',
    brand: 'OGKILS',
    x: 42,
    y: 54,
    color: '#FFFFFF'
  },
  {
    id: '15',
    name: 'LD-700',
    brand: 'OGKILS',
    x: 40,
    y: 64,
    color: '#FFFFFF'
  },
  {
    id: '16',
    name: 'LD-800LT',
    brand: 'OGKILS',
    x: 75,
    y: 56,
    color: '#FFFFFF'
  },
  {
    id: '17',
    name: 'LD-77P',
    brand: 'OGKILS',
    x: 55,
    y: 34,
    color: '#FFFFFF'
  }
];
