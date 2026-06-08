/**
 * [WHO]: 提供临床级静态计划数据（RHINITIS_PLAN 过敏性鼻炎管理 / WRIST_PLAN 左腕 6 周复健），含每日/每周/环境/采购/时间线/红线/用药/医院等子结构
 * [FROM]: 纯常量数据；无运行时依赖；类型来自 src/types 的 PlanItem / ShoppingItem
 * [TO]: 被 src/components/plans/RhinitisPlan.tsx 整体消费 RHINITIS_PLAN；被 src/components/plans/WristPlan.tsx 整体消费 WRIST_PLAN
 * [HERE]: src/data/plans.ts - 冻结的医学级方案；组件层只读取不修改；任何调整需医生确认后改此文件
 */
export const RHINITIS_PLAN = {
  id: 'rhinitis',
  name: '过敏性鼻炎管理',
  icon: '🤧',
  desc: '尘螨过敏自我管理',
  dailyItems: {
    morning: [
      { id: 'wash_am', text: '生理盐水洗鼻 1 次' },
      { id: 'spray', text: '鼻用激素喷剂（按药师指导）' },
      { id: 'antihist', text: '抗组胺药（如在服用）' },
    ],
    daytime: [
      { id: 'water', text: '多喝温水，帮分泌物变稀排出' },
      { id: 'humid', text: '看湿度计，潮就开除湿机，目标 ≤ 50%' },
      { id: 'wash_face', text: '外出回家先洗手洗脸' },
    ],
    evening: [
      { id: 'wash_pm', text: '生理盐水洗鼻第 2 次' },
      { id: 'towel', text: '热毛巾敷鼻子和脸颊 5–10 分钟' },
      { id: 'pillow', text: '枕头垫高一点，减少夜间鼻塞' },
      { id: 'humid_pm', text: '确认卧室湿度已降到 50% 以下' },
    ],
  },
  weeklyItems: [
    { id: 'wash_hot', text: '床单被套枕套 55℃ 以上热水洗' },
    { id: 'freeze', text: '不能高温洗的：装袋冷冻 24 小时再洗' },
    { id: 'vacuum', text: 'HEPA 吸尘器吸床垫、地面、沙发（戴口罩）' },
    { id: 'dust', text: '湿抹布擦灰，不要干掸' },
    { id: 'air', text: '天气好时通风、晾晒被褥' },
  ],
  environmentItems: [
    { id: 'env_cover', text: '给床垫、被子、枕头套上防螨包套' },
    { id: 'env_reduce', text: '卧室做减法：撤掉地毯、厚重布艺窗帘、多余毛绒玩具，杂物收进柜子' },
    { id: 'env_humid', text: '卧室固定放一个湿度计，随时能看' },
    { id: 'env_pillow', text: '更换老旧枕头（螨虫重灾区）' },
  ],
  shopping: [
    { id: 'cover', name: '防螨包套', rec: 'ミクロガード Premium', priority: 1, note: '给床垫、被子、枕头都套上' },
    { id: 'dehumid', name: '除湿机 + 湿度计', rec: '压缩机式（コロナ/シャープ/パナソニック/アイリスオーヤマ），另购一个湿度计', priority: 2, note: '从源头控湿到 50% 以下，让螨虫无法繁殖' },
    { id: 'vacuum_buy', name: '吸尘设备', rec: '戴森 Dyson（配床垫吸头）', priority: 3, note: '吸走床垫/被褥过敏原' },
    { id: 'purifier', name: '空气净化器（可选）', rec: '带 HEPA 滤网', priority: 4, note: '减少空气飘浮过敏原' },
    { id: 'consumable', name: '耗材', rec: '洗鼻器+洗鼻盐、备换的防螨床品、口罩（打扫时戴）', priority: 5, note: '日常护理与清洁用' },
  ],
  timeline: [
    { day: '第 1–3 天', text: '全部护理 + 控螨同步开始。可能还没明显变化，别灰心。', flag: false },
    { day: '第 4–7 天', text: '鼻塞、黄涕通常开始逐渐减轻。继续坚持。', flag: false },
    { day: '第 7–10 天', text: '多数情况应明显好转，往收尾走。', flag: false },
    { day: '⚑ 升级节点', text: '若满 10 天仍无改善，或一度好转后又突然加重——这是「可能需要处方药」的典型信号，请务必找专业人士。', flag: true },
    { day: '长期', text: '尘螨控制的效果需要数周积累才体现到症状上，控湿 + 包套 + 高温洗要长期坚持。', flag: false },
  ],
  redLines: [
    '眼睛周围红肿、眼痛、视力模糊或看东西重影',
    '剧烈头痛、脖子发硬、意识模糊、精神很差',
    '额头肿胀',
    '持续高烧',
  ],
  medications: [
    { name: '生理盐水洗鼻', tag: 'safe', tagLabel: '基础·安全', desc: '整套护理的基石。冲走黏稠分泌物、帮鼻窦引流、减轻鼻塞，副作用极小，可长期每天做。' },
    { name: '鼻用糖皮质激素喷剂', tag: 'care', tagLabel: '咨询药师', desc: '同时压制过敏引起的黏膜炎症 + 减轻鼻窦炎症和鼻塞。需连续使用数天才见效，要坚持。' },
    { name: '口服第二代抗组胺药', tag: 'care', tagLabel: '咨询药师', desc: '如氯雷他定、西替利嗪等，缓解打喷嚏、流涕、瘙痒，嗜睡较少。一般每日一次。' },
    { name: '鼻塞减充血喷剂', tag: 'stop', tagLabel: '限期短用', desc: '鼻塞极难受时短期应急。连续使用不可超过 5–7 天，否则会反弹性鼻塞。' },
  ],
};

export const WRIST_PLAN = {
  id: 'wrist',
  name: '左腕6周复健',
  icon: '💪',
  desc: '左腕术后康复训练',
  phases: [
    {
      name: '第1—2周 · 松解期',
      weeks: '1-2',
      goal: '降低软组织紧张、改善前臂旋转活动度、松解疤痕。不做任何抗阻、不做任何负重。',
      sessions: {
        morning: {
          time: '09:00—09:08',
          duration: '8 分钟',
          items: [
            { id: 'scar_am', text: '① 疤痕松动 · 2 MIN', detail: '涂护手霜，拇指沿疤痕画圈、上下推、左右推，让疤痕和深层组织能滑动' },
            { id: 'fascia_am', text: '② 前臂背侧筋膜松解 · 3 MIN · 筋膜球', detail: '筋膜球压在前臂背侧（伸肌群），找酸点停留20-30秒。避开腕横纹、骨头突起、手术疤痕' },
            { id: 'stretch_am', text: '③ 掌屈渐进牵伸 · 3 MIN · 3×30秒 · 最重要的动作', detail: '手心朝下放桌边，手腕悬空。第1组靠重力，第2-3组右手轻加压到"轻微紧绷但不酸痛"的位置' },
          ],
        },
        lunch: {
          time: '12:30—12:33',
          duration: '3 分钟',
          items: [
            { id: 'rotate', text: '④ 前臂旋转活动度 · 2 MIN · 来回10次', detail: '肘部夹紧贴身体（关键），前臂水平，旋前↔旋后，右手辅助到舒适最大范围停5秒' },
            { id: 'radial', text: '⑤ 桡偏/尺偏被动 · 1 MIN · 各5次', detail: '右手握住左手，轻柔辅助往拇指方向偏5次，再往小指方向偏5次' },
          ],
        },
        evening: {
          time: '22:15—22:29',
          duration: '14 分钟',
          items: [
            { id: 'scar_pm', text: '⑥ 疤痕松动 · 2 MIN', detail: '同早上，一天两次是最低频率' },
            { id: 'fascia_pm', text: '⑦ 前臂屈肌+伸肌松解 · 5 MIN', detail: '屈伸各2.5分钟，晚上补手心面，两面都要松' },
            { id: 'stretch_pm', text: '⑧ 掌屈渐进牵伸 · 3 MIN · 3×30秒', detail: '和早上完全一样，一天两次是改善关节囊粘连的最低剂量' },
            { id: 'prayer', text: '⑨ 祈祷式反向牵伸 · 2 MIN · 5×20秒', detail: '双手手背相对指尖朝下，慢慢往下压到紧绷感停20秒' },
            { id: 'dorsal', text: '⑩ 手背骨间软组织按压 · 2 MIN', detail: '拇指按压骨头之间软组织缝隙，Lister结节周围轻柔环形按摩。跳过最酸凹陷点' },
          ],
        },
      },
      prohibited: [
        '俯卧撑（任何形式）— 手腕最大背伸+负重',
        '平板支撑 — 同上，用肘部平板替代',
        '瑜伽下犬式 — 手腕背伸+体重，换海豚式',
        '用手撑椅子/床起身 — 单次冲击性负重，撑膝盖替代',
        '拧毛巾、拧瓶盖 — 旋转+捏力组合',
        '左手提重物 >2kg — 持续负荷',
        '用手推重门 — 瞬间冲击',
        '引体向上/单杠 — 悬吊+腕关节极限受力',
      ],
    },
    {
      name: '第3—4周 · 唤醒期',
      weeks: '3-4',
      goal: '新增等长收缩（三个方向）+ 抓握训练。等长收缩肌肉用力但关节不动，最安全的激活方式。',
      enterCondition: '第2周末评估后，按压痛和日常酸痛没有加重才进入。有加重则停留在第1-2周再做一轮。',
      sessions: {
        morning: {
          time: '09:00—09:08',
          duration: '8 分钟',
          items: [
            { id: 'scar_am2', text: '① 疤痕松动 · 2 MIN' },
            { id: 'stretch_am2', text: '② 掌屈渐进牵伸 · 3 MIN · 3×30秒', detail: '记录角度，看是否比上周多了几度' },
            { id: 'iso_am', text: '③ 等长收缩·三方向（新增） · 3 MIN', detail: '背伸/桡偏/尺偏各10秒×5次，30%力气，手腕完全不动。超过2分疼痛则跳过该方向' },
          ],
        },
        lunch: {
          time: '12:30—12:34',
          duration: '4 分钟',
          items: [
            { id: 'rotate2', text: '④ 前臂旋转活动度 · 2 MIN · 来回10次' },
            { id: 'grip', text: '⑤ 抓握等长（新增） · 2 MIN · 5秒×20次', detail: '握力球/毛巾，60%最大握力，工位上可以偷偷做' },
          ],
        },
        evening: {
          time: '22:15—22:28',
          duration: '13 分钟',
          items: [
            { id: 'scar_fascia_pm2', text: '⑥ 疤痕松动+筋膜松解 · 5 MIN', detail: '疤痕松动2分钟，屈肌+伸肌各1.5分钟' },
            { id: 'stretch_pm2', text: '⑦ 掌屈渐进牵伸 · 3 MIN · 3×30秒' },
            { id: 'iso_pm', text: '⑧ 等长收缩·三方向（加强） · 3 MIN', detail: '每方向10秒×10次，依然30%力气不加大力度' },
            { id: 'prayer2', text: '⑨ 祈祷式反向牵伸 · 2 MIN · 5×20秒' },
          ],
        },
      },
    },
    {
      name: '第5—6周 · 渐进期',
      weeks: '5-6',
      goal: '新增250ml水瓶轻负荷训练（仅掌屈/桡尺偏方向）。背伸抗阻依然不做，撑地动作依然禁止。',
      enterCondition: '第4周末评估：①掌屈角度改善 ②按压酸痛下降 ③撑起困难度下降 ④日常酸痛频率减少。三项以上才进入。',
      sessions: {
        morning: {
          time: '09:00—09:08',
          duration: '8 分钟',
          items: [
            { id: 'scar_stretch3', text: '① 疤痕松动+掌屈渐进牵伸 · 5 MIN', detail: '持续推进掌屈角度' },
            { id: 'bottle_flex', text: '② 水瓶轻负荷·掌屈（新增） · 3 MIN · 10次×2组', detail: '250ml水瓶，前臂放大腿手腕悬空，3秒去3秒回。不做背伸方向' },
          ],
        },
        lunch: {
          time: '12:30—12:34',
          duration: '4 分钟',
          items: [
            { id: 'rotate3', text: '③ 前臂旋转·加轻阻力 · 2 MIN', detail: '手握250ml水瓶做旋前-旋后，水瓶重量产生轻微杠杆阻力' },
            { id: 'grip3', text: '④ 抓握强化 · 2 MIN · 5秒×30次×2组' },
          ],
        },
        evening: {
          time: '22:15—22:29',
          duration: '14 分钟',
          items: [
            { id: 'scar_fascia3', text: '⑤ 疤痕松动+筋膜松解 · 5 MIN' },
            { id: 'stretch3', text: '⑥ 掌屈渐进牵伸 · 3 MIN · 3×30秒' },
            { id: 'bottle_radial', text: '⑦ 水瓶·桡偏/尺偏（新增） · 3 MIN · 各10次×2组', detail: '拇指朝上握水瓶，桡偏回中+尺偏回中' },
            { id: 'iso3', text: '⑧ 等长收缩维持 · 3 MIN', detail: '第3-4周的等长收缩三方向，每方向10次，维持不退步' },
          ],
        },
      },
      prohibited: [
        '背伸抗阻',
        '撑地动作',
        '俯卧撑（任何形式）',
        '引体向上',
        '左手提 >2kg',
      ],
    },
  ],
  assessments: [
    { week: 1, fields: ['掌屈"开始酸"的角度(基线)°', '按压鼻烟窝疼痛 /10', '按压Lister远端疼痛 /10', '撑起身困难度 /10'], isCheckpoint: false, isFinal: false },
    { week: 2, fields: ['掌屈角度 °', '按压鼻烟窝疼痛 /10', '按压Lister远端疼痛 /10', '撑起身困难度 /10'], isCheckpoint: true, isFinal: false },
    { week: 3, fields: ['掌屈角度 °', '按压鼻烟窝 /10', '按压Lister /10', '撑起困难 /10'], isCheckpoint: false, isFinal: false },
    { week: 4, fields: ['掌屈角度 °', '按压鼻烟窝 /10', '按压Lister /10', '撑起困难 /10'], isCheckpoint: true, isFinal: false },
    { week: 5, fields: ['掌屈角度 °', '按压鼻烟窝 /10', '按压Lister /10', '撑起困难 /10'], isCheckpoint: false, isFinal: false },
    { week: 6, fields: ['掌屈角度 °', '按压鼻烟窝 /10', '按压Lister /10', '撑起困难 /10'], isCheckpoint: false, isFinal: true },
  ],
  shopping: [
    { id: 'brace', name: '腕关节固定支具', rec: '限制背伸型，短款，左手款，透气材质', price: '¥60–120', priority: 'must' },
    { id: 'massage_ball', name: '筋膜球 / 网球', rec: '硬度适中，直径5-7cm', price: '¥15–40', priority: 'must' },
    { id: 'grip_ball', name: '握力球（软）', rec: '硅胶材质，中等硬度', price: '¥10–30', priority: 'must' },
    { id: 'pushup_handles', name: '俯卧撑支架（中立握把）', rec: '握把式，钢制比塑料稳', price: '¥30–80', priority: 'should' },
    { id: 'angle_app', name: '量角器', rec: '手机下载"角度测量仪"App即可', price: '免费', priority: 'must' },
    { id: 'towel', name: '毛巾（旧的）', rec: '卷成圆柱形代替握力球', price: '¥0', priority: 'must' },
    { id: 'bottle', name: '250ml 矿泉水瓶', rec: '第5周前备好，装满水约250g', price: '¥2', priority: 'could' },
    { id: 'cream', name: '润肤霜 / 护手霜', rec: '凡士林最便宜最有效，用于疤痕松动按摩', price: '¥10–30', priority: 'must' },
    { id: 'external_med', name: '外用止痛/消炎药', rec: '请咨询药店药师，常见选择：双氯芬酸钠乳胶（扶他林）、氟比洛芬凝胶贴膏', price: '¥20–60', priority: 'should', note: '疼痛来源未确诊，外用药请先咨询药师' },
    { id: 'notebook', name: '小本子 + 笔', rec: '每周测量掌屈角度、记录疼痛分数用', price: '¥5–15', priority: 'must' },
  ],
  exitRules: [
    '6 周结束后，按压鼻烟窝或 Lister 远端凹陷仍有酸痛——软组织改善了会减轻，结构性损伤不会因为练习消失',
    '6 周结束后，撑起身动作仍然困难——这是功能丧失，不是单纯的软组织问题',
    '6 周结束后，掌屈角度完全没有改善——关节囊粘连若是主因，6 周认真牵伸后应有可见改变',
    '任何阶段出现新症状：手腕弹响伴疼痛 / 手指麻 / 局部肿胀 / 握力突然下降——立刻停，立刻去医院',
    '任何阶段疼痛加重并持续 2 天以上——说明在激惹而不是在修复',
    '任何阶段出现夜间静息痛——不动也疼，尤其夜间加重，是炎症或骨坏死的信号',
  ],
  hospitals: [
    { rank: 'FIRST CHOICE · 首选', name: '杭州市第一人民医院', dept: '骨科 · 运动医学中心 / 手外科', desc: '明确开展腕关节镜手术，省内较早开展运动医学。挂号选手外科或骨科运动医学组，优先选副主任医师以上。' },
    { rank: 'ALTERNATIVE · 备选 A', name: '浙江大学医学院附属第二医院', dept: '骨科 · 手外科亚专科', desc: '浙江省骨科综合实力最强，手外科是传统强项。建议挂手外科专家门诊。' },
    { rank: 'ALTERNATIVE · 备选 B', name: '浙江大学医学院附属邵逸夫医院', dept: '骨科 · 手外科', desc: '就诊体验口碑较好，医生问诊通常较仔细。适合"需要重新梳理诊断"的疑难情况。' },
  ],
};
