import type { Case } from '../../types';

/**
 * 案件一：暴雨夜失窃案
 * ------------------------------------------------------------------
 * 富豪收藏家陈志远在暴雨夜举办私人鉴赏会，展示新购的古玉
 * "碧玉蟠龙佩"。深夜展室警报响起，玉佩不翼而飞，展柜玻璃碎裂。
 * 真凶：秘书李伟。推理链：玻璃由内向外碎裂（内应）→ 丝质纤维
 * 仅匹配李伟西装 → 李伟有赌债动机 → 李伟掌握保险柜密码（备用钥匙）
 * → 厨师证词推翻其厨房不在场证明 → 袖口玻璃屑为直接物证。
 * ------------------------------------------------------------------
 */
export const rainyNightTheft: Case = {
  id: 'case_rainy_night_theft',
  title: '暴雨夜失窃案',
  subtitle: '碧玉蟠龙佩失踪事件',
  difficulty: 'normal',
  synopsis:
    '暴雨夜，富豪宅邸的展室警报骤然响起，价值连城的古玉不翼而飞。四名在场者各执一词，碎裂的展柜与一串脚印背后，究竟隐藏着怎样的谎言？',
  background: `十月的最后一个夜晚，暴雨如注。

富商陈志远在自家的"听雨轩"宅邸举办了一场私人鉴赏会，邀请三位客人观摩他新近从海外拍回的古玉——"碧玉蟠龙佩"。据陈志远称，此玉价值逾千万，是他毕生收藏的点睛之笔。

鉴赏于晚间九时结束，众人返回客厅小坐。十时许，雨势骤急。十时三十分，陈志远因身体不适独自回书房休息，将展室钥匙随身带走。

十一时整，一道惊雷劈下，宅邸灯光齐齐闪烁数秒。十一时十五分，展室方向传来刺耳的警报声。众人赶到时，只见展室门虚掩，展柜玻璃碎裂，"碧玉蟠龙佩"已不知所踪。

窗门紧闭，警报未被人为破坏，而展室钥匙仍在陈志远的口袋里。四名在场者——女儿陈雨晴、秘书李伟、鉴定专家王德明、管家张福——皆声称自己清白。

真相，藏在碎裂的玻璃与交错的证词之中。`,
  scene: {
    title: '听雨轩 · 展室',
    intro:
      '展室约二十平米，四壁皆为胡桃木书架，正中是一座防弹玻璃展柜。此刻展柜玻璃已成蛛网般碎裂，地毯上有一串湿漉漉的脚印从窗边延伸至展柜。窗扇紧闭，从内侧扣着搭扣。空气中弥漫着雨水与一丝若有若无的丝线焦糊味。',
    hotspots: [
      {
        id: 'hs_broken_glass',
        name: '碎裂的展柜玻璃',
        description:
          '展柜正面的防弹玻璃呈放射状碎裂，大半已脱落。走近细看，玻璃碎片大多散落在展柜外侧的地毯上。',
        position: { x: 48, y: 52 },
        revealsEvidenceId: 'ev_broken_glass',
      },
      {
        id: 'hs_footprints',
        name: '地毯上的湿脚印',
        description:
          '一串泥水脚印从窗边向展柜方向延伸，共约七步。脚印尺码较大，花纹清晰。',
        position: { x: 22, y: 70 },
        revealsEvidenceId: 'ev_wet_footprints',
        requires: ['ev_broken_glass'],
      },
      {
        id: 'hs_window',
        name: '紧闭的窗户',
        description:
          '窗扇从内侧扣着搭扣，玻璃上有水珠流下。窗台与窗框上没有手印或撬痕。',
        position: { x: 12, y: 38 },
        revealsEvidenceId: 'ev_locked_window',
      },
      {
        id: 'hs_silk_fiber',
        name: '玻璃上的纤维',
        description:
          '在一块较大的碎玻璃边缘，挂着一缕深蓝色的丝质纤维，约两厘米长，似乎是被什么东西刮下的。',
        position: { x: 55, y: 60 },
        revealsEvidenceId: 'ev_silk_fiber',
        requires: ['ev_broken_glass'],
      },
      {
        id: 'hs_vent',
        name: '天花板通风口',
        description:
          '通风口格栅完好，螺丝无松动痕迹，下方地毯上没有灰尘掉落——排除从通风口进入的可能。',
        position: { x: 70, y: 12 },
        revealsEvidenceId: 'ev_vent_intact',
      },
    ],
  },
  evidence: [
    {
      id: 'ev_broken_glass',
      caseId: 'case_rainy_night_theft',
      name: '由内向外碎裂的展柜玻璃',
      type: 'physical',
      category: 'object',
      description:
        '展柜玻璃呈放射状碎裂，碎片大多散落在展柜外侧的地毯上，而非展柜内部。',
      source: '案发现场 · 展室',
      isInitial: true,
      analysis:
        '防弹玻璃的碎裂方向取决于受力方向。碎片散落在展柜外侧（即陈列室内），说明冲击力来自展柜内部。换言之，玻璃是被人从展柜内侧击碎的——这是典型的"伪造外人闯入"手法，作案者在展室内部。',
    },
    {
      id: 'ev_wet_footprints',
      caseId: 'case_rainy_night_theft',
      name: '窗边的湿脚印',
      type: 'physical',
      category: 'scene',
      description:
        '一串 42 码泥水脚印从窗边延伸至展柜，花纹清晰，间距均匀。',
      source: '案发现场 · 展室地毯',
      isInitial: true,
      requires: ['ev_broken_glass'],
      analysis:
        '脚印虽清晰，但仔细观察：暴雨中行走的人脚印会因打滑而深浅不一、边缘模糊；而这串脚印深浅一致、边缘锐利，更像是有人站在原地刻意留下。更重要的是——窗户从内侧反锁（见"紧闭的窗户"），根本不可能有外人翻窗而入。这串脚印是伪造的，目的是嫁祸"外部闯入者"。',
    },
    {
      id: 'ev_locked_window',
      caseId: 'case_rainy_night_theft',
      name: '从内侧反锁的窗户',
      type: 'physical',
      category: 'scene',
      description:
        '窗扇扣着内侧搭扣，窗框无撬痕，玻璃上的雨水痕迹完整连续。',
      source: '案发现场 · 展室窗户',
      isInitial: true,
      analysis:
        '窗户从内侧反锁且无撬痕，说明案发期间窗户从未被打开过。结合脚印证据，可确认不存在外部闯入者——作案者本就在宅邸内部。',
    },
    {
      id: 'ev_silk_fiber',
      caseId: 'case_rainy_night_theft',
      name: '深蓝色丝质纤维',
      type: 'physical',
      category: 'object',
      description:
        '碎玻璃边缘挂着一缕约两厘米长的深蓝色丝质纤维。',
      source: '案发现场 · 展柜碎玻璃',
      isInitial: true,
      requires: ['ev_broken_glass'],
      analysis:
        '纤维为高级丝绸内衬材质。比对当晚四人着装：陈雨晴穿棉质睡裙，王德明穿羊毛衫，张福穿棉质管家制服，唯有李伟穿着深蓝色丝质内衬的定制西装。这缕纤维极可能来自李伟的西装内衬，在击碎玻璃时被挂下。',
    },
    {
      id: 'ev_vent_intact',
      caseId: 'case_rainy_night_theft',
      name: '完好的通风口',
      type: 'physical',
      category: 'scene',
      description:
        '天花板通风口格栅螺丝未松动，下方地毯无灰尘掉落。',
      source: '案发现场 · 展室天花板',
      isInitial: true,
      analysis:
        '通风口完好且无灰尘，排除了从通风管道潜入的可能。至此，展室唯一的出入口只剩房门，而房门需要钥匙——钥匙在陈志远身上，备用钥匙在书房保险柜内。',
    },
    {
      id: 'ev_safe_key_access',
      caseId: 'case_rainy_night_theft',
      name: '保险柜密码的知情范围',
      type: 'document',
      category: 'document',
      description:
        '展室备用钥匙锁在书房保险柜中。保险柜密码仅陈志远本人与秘书李伟知晓——李伟负责代管遗嘱、藏品清单等机密文书。',
      source: '管家张福的陈述 + 文书管理制度',
      isInitial: false,
      requires: ['ev_vent_intact'],
      analysis:
        '既然展室只能用钥匙进入，而钥匙在陈志远身上，作案者必须拿到备用钥匙。知道保险柜密码的人只有陈志远和李伟。陈志远是受害者本人，因此有能力取得备用钥匙的，只剩李伟一人。',
    },
    {
      id: 'ev_gambling_debt',
      caseId: 'case_rainy_night_theft',
      name: '李伟的赌债欠条',
      type: 'document',
      category: 'document',
      description:
        '书房废纸篓中揉成一团的欠条：李伟欠"鸿运赌场"人民币 50 万元，三日内还清，否则"后果自负"。落款日期为本月五日。',
      source: '书房废纸篓',
      isInitial: false,
      requires: ['ev_silk_fiber'],
      analysis:
        '50 万赌债，三日期限，而"碧玉蟠龙佩"价值逾千万。李伟有明确且急迫的经济动机。他在鉴赏会上见过玉佩，清楚其价值，也清楚展室与保险柜的安保细节——具备作案的全部条件。',
    },
    {
      id: 'ev_cook_testimony',
      caseId: 'case_rainy_night_theft',
      name: '厨师的证词',
      type: 'testimony',
      category: 'person',
      description:
        '厨师老赵证实：当晚 22:30 至 23:15，厨房始终只有他一人，李伟从未进入厨房。',
      source: '厨师老赵（宅邸工作人员，无利害关系）',
      isInitial: false,
      requires: ['ev_gambling_debt'],
      analysis:
        '李伟声称"22:30 后一直在厨房"，但厨师明确表示厨房无人。李伟的不在场证明是谎言。23:00 灯光闪烁时监控短暂离线——那正是他行动的时间窗口。',
    },
    {
      id: 'ev_glass_dust_on_sleeve',
      caseId: 'case_rainy_night_theft',
      name: '李伟袖口的玻璃屑',
      type: 'physical',
      category: 'object',
      description:
        '李伟深蓝色西装的右袖口内侧，粘着几枚细小的透明玻璃屑，与展柜玻璃材质一致。',
      source: '对李伟随身衣物的检查',
      isInitial: false,
      requires: ['ev_silk_fiber', 'ev_cook_testimony'],
      analysis:
        '这是将李伟与展柜直接关联的物证。玻璃屑藏在袖口内侧而非外侧，符合"从内侧击碎玻璃时手臂伸入展柜"的动作特征。结合丝质纤维证据，可确定李伟就是击碎展柜玻璃的人。',
    },
    {
      id: 'ev_yuqing_pill_cup',
      caseId: 'case_rainy_night_theft',
      name: '陈雨晴的安眠药杯',
      type: 'physical',
      category: 'object',
      description:
        '陈雨晴卧室床头柜上的瓷杯，杯底有白色药渍。经化验，杯中残留安眠药剂量仅为常规量的三分之一。',
      source: '陈雨晴卧室',
      isInitial: false,
      requires: ['ev_locked_window'],
      analysis:
        '陈雨晴称"服下安眠药后一觉睡到警报响起"，但杯中药量不足以致眠。她在说谎——不过她的谎言与玉佩失窃无关：她当晚其实在偷偷打电话联系律师，准备起诉父亲夺回继承权，不愿让他人知道自己没睡。她不是凶手。',
    },
    {
      id: 'ev_zhangfu_dry_shoes',
      caseId: 'case_rainy_night_theft',
      name: '张福的干鞋底',
      type: 'physical',
      category: 'object',
      description:
        '管家张福的皮鞋鞋底干燥干净，没有雨水或泥痕。',
      source: '对张福随身物品的观察',
      isInitial: false,
      requires: ['ev_locked_window'],
      analysis:
        '张福称"冒雨去花园检查漏水"，但暴雨中鞋底不可能保持干燥。他在说谎——他当晚实际是偷偷去书房用座机给住院的儿子打电话（儿子重病，他向陈志远借钱被拒），怕被发现才编造了花园的说辞。他不是凶手。',
    },
    {
      id: 'ev_wang_glove',
      caseId: 'case_rainy_night_theft',
      name: '鉴赏记录与手套',
      type: 'document',
      category: 'document',
      description:
        '鉴赏会记录显示：所有接触玉佩的人都佩戴了白色棉质手套。王德明的手套在鉴赏结束后已交还管家，至今封存在塑封袋中。',
      source: '鉴赏会流程记录',
      isInitial: false,
      requires: ['ev_broken_glass'],
      analysis:
        '展柜外侧发现了王德明的指纹，但鉴赏时所有人都戴手套——这枚指纹只能是鉴赏前或鉴赏后留下的。经核实，是鉴赏开始前王德明检查展柜时触摸留下的，与案发无关。王德明虽对玉佩有学术觊觎，但他没有展室钥匙，也没有作案动机（学术声誉重于财物）。他不是凶手。',
    },
    {
      id: 'ev_monitor_blackout',
      caseId: 'case_rainy_night_theft',
      name: '监控的十秒盲区',
      type: 'digital',
      category: 'digital',
      description:
        '走廊监控录像显示 22:30 至 23:15 无人经过，但在 23:00 灯光闪烁期间，监控因电压不稳离线约 10 秒。',
      source: '宅邸安保系统',
      isInitial: false,
      requires: ['ev_vent_intact'],
      analysis:
        '监控并非被人为破坏，而是雷击导致的电压波动使其短暂离线。作案者正是利用了这 10 秒盲区，从书房（取备用钥匙）前往展室。10 秒足够穿过走廊。',
    },
  ],
  suspects: [
    {
      id: 'sus_liwei',
      caseId: 'case_rainy_night_theft',
      name: '李伟',
      role: '陈志远的私人秘书',
      description:
        '35 岁，任职五年，负责管理陈志远的藏品清单、文书与日常行程。性格谨慎，衣着考究，今晚穿着一套深蓝色定制西装。',
      motive: '表面无明显动机。但其名下有一笔近期到期的债务（见证据）。',
      alibi: '声称 22:30 后一直在厨房为客人准备热茶，直到警报响起。',
      detail: { 鞋码: '39', 着装: '深蓝色丝质内衬西装' },
      isCulprit: true,
    },
    {
      id: 'sus_yuqing',
      caseId: 'case_rainy_night_theft',
      name: '陈雨晴',
      role: '陈志远的女儿',
      description:
        '28 岁，与父亲关系紧张，近期被切断经济来源。今晚穿着棉质睡裙，看起来疲惫而焦虑。',
      motive: '与父亲因遗产问题关系恶化，急需用钱。',
      alibi: '声称 22:00 后回卧室服下安眠药，一觉睡到警报响起。',
      detail: { 鞋码: '37', 着装: '棉质睡裙' },
      isCulprit: false,
    },
    {
      id: 'sus_wang',
      caseId: 'case_rainy_night_theft',
      name: '王德明',
      role: '古玉鉴定专家 / 客座教授',
      description:
        '55 岁，国内知名古玉鉴定学者，今晚受邀为"碧玉蟠龙佩"做最终鉴定。穿着灰色羊毛衫，戴金丝眼镜。',
      motive: '对这枚罕见玉佩有强烈的学术兴趣，曾在论文中提及"此生未见第二枚"。',
      alibi: '声称鉴赏结束后一直在客厅阅读图录，未离开过。',
      detail: { 鞋码: '42', 着装: '灰色羊毛衫' },
      isCulprit: false,
    },
    {
      id: 'sus_zhangfu',
      caseId: 'case_rainy_night_theft',
      name: '张福',
      role: '陈家管家',
      description:
        '62 岁，服务陈家三十年，深得陈志远信任。穿着整洁的棉质管家制服，面容憔悴。',
      motive: '近期因儿子重病向陈志远借钱被拒，心存不满。',
      alibi: '声称 22:30 后冒雨去花园检查屋顶漏水，直到警报响起才返回。',
      detail: { 鞋码: '41', 着装: '棉质管家制服' },
      isCulprit: false,
    },
  ],
  testimonies: [
    {
      id: 'tes_liwei_kitchen',
      caseId: 'case_rainy_night_theft',
      speakerId: 'sus_liwei',
      speakerName: '李伟',
      speakerRole: '私人秘书',
      content:
        '十点半之后我一直在厨房，给大家准备热茶和夜宵。厨师老赵可以作证。直到十一点一刻警报响了，我才从厨房跑出来。',
      contradicts: ['ev_cook_testimony'],
      time: '案发当晚',
    },
    {
      id: 'tes_yuqing_sleep',
      caseId: 'case_rainy_night_theft',
      speakerId: 'sus_yuqing',
      speakerName: '陈雨晴',
      speakerRole: '女儿',
      content:
        '我十点就回房了，吃了片安眠药，睡得很沉。什么警报、脚步声，我完全没听到。还是管家来敲门我才醒。',
      contradicts: ['ev_yuqing_pill_cup'],
      time: '案发当晚',
    },
    {
      id: 'tes_wang_livingroom',
      caseId: 'case_rainy_night_theft',
      speakerId: 'sus_wang',
      speakerName: '王德明',
      speakerRole: '鉴定专家',
      content:
        '鉴赏结束后我一直在客厅翻阅陈先生的藏品图录，没有离开过。那本图录很精彩，我看得入了迷。',
      supports: ['ev_wang_glove'],
      time: '案发当晚',
    },
    {
      id: 'tes_zhangfu_garden',
      caseId: 'case_rainy_night_theft',
      speakerId: 'sus_zhangfu',
      speakerName: '张福',
      speakerRole: '管家',
      content:
        '雨太大了，我担心花园那侧屋顶漏水，十点半之后出去检查了一圈，还摔了一跤呢。回来的时候就听到警报了。',
      contradicts: ['ev_zhangfu_dry_shoes'],
      time: '案发当晚',
    },
    {
      id: 'tes_cook_empty',
      caseId: 'case_rainy_night_theft',
      speakerId: 'wit_cook',
      speakerName: '老赵',
      speakerRole: '厨师',
      content:
        '我一直在厨房收拾。从十点半到十一点一刻，厨房里除了我没别人。李秘书？没见到他进来过。',
      supports: ['ev_cook_testimony'],
      contradicts: ['tes_liwei_kitchen'],
      time: '案发当晚',
    },
    {
      id: 'tes_chen_key',
      caseId: 'case_rainy_night_theft',
      speakerId: 'vic_chen',
      speakerName: '陈志远',
      speakerRole: '屋主 / 受害人',
      content:
        '展室钥匙我一直随身带着，洗澡都没离身。备用钥匙锁在书房保险柜里，密码只有我和李伟知道——他管文书，没办法。',
      supports: ['ev_safe_key_access'],
      time: '案发当晚',
    },
  ],
  deduction: {
    culpritStep: {
      id: 'step_culprit',
      question: '综合所有线索，你认为谁是偷走"碧玉蟠龙佩"的真凶？',
      options: ['sus_liwei', 'sus_yuqing', 'sus_wang', 'sus_zhangfu'],
      correct: ['sus_liwei'],
      multi: false,
      hint: '注意玻璃的碎裂方向、丝质纤维的归属，以及谁有机会拿到备用钥匙。',
      explanation:
        '真凶是李伟。玻璃由内向外碎裂证明是内部人员；丝质纤维仅匹配他的西装；他掌握保险柜密码可取得备用钥匙；他有 50 万赌债的急迫动机；厨师证词推翻了他的厨房不在场证明；袖口的玻璃屑是直接物证。',
    },
    reasoningSteps: [
      {
        id: 'step_inside_job',
        question: '哪条证据最早证明这是"内部作案"而非外人闯入？',
        options: [
          'ev_broken_glass',
          'ev_wet_footprints',
          'ev_locked_window',
          'ev_vent_intact',
        ],
        correct: ['ev_broken_glass'],
        multi: false,
        hint: '观察玻璃碎片落在哪一侧。',
        explanation:
          '展柜玻璃碎片散落在外侧（陈列室内），说明冲击力来自展柜内部——是作案者在展室内部击碎玻璃，伪造外人闯入的假象。',
      },
      {
        id: 'step_key_evidence',
        question: '哪两条证据直接将李伟与作案现场关联？（多选）',
        options: [
          'ev_silk_fiber',
          'ev_glass_dust_on_sleeve',
          'ev_gambling_debt',
          'ev_cook_testimony',
        ],
        correct: ['ev_silk_fiber', 'ev_glass_dust_on_sleeve'],
        multi: true,
        hint: '一条是纤维，一条是玻璃屑，都来自他的西装。',
        explanation:
          '深蓝色丝质纤维（仅李伟穿丝质内衬西装）和袖口内侧的玻璃屑，是将李伟与展柜直接关联的两件物证。',
      },
      {
        id: 'step_motive',
        question: '李伟的作案动机是什么？',
        options: [
          'ev_gambling_debt',
          'ev_safe_key_access',
          'ev_cook_testimony',
          'ev_monitor_blackout',
        ],
        correct: ['ev_gambling_debt'],
        multi: false,
        hint: '找一张纸，上面有数字和期限。',
        explanation:
          '李伟欠赌场 50 万元，三日内还清。"碧玉蟠龙佩"价值逾千万，足以偿清债务并改变命运——这就是他的动机。',
      },
      {
        id: 'step_opportunity',
        question: '李伟如何获得进入展室的钥匙？',
        options: [
          'ev_safe_key_access',
          'ev_monitor_blackout',
          'ev_cook_testimony',
          'ev_broken_glass',
        ],
        correct: ['ev_safe_key_access'],
        multi: false,
        hint: '钥匙在保险柜里，谁知道密码？',
        explanation:
          '展室备用钥匙锁在书房保险柜中，而保险柜密码仅陈志远与李伟知晓。李伟利用 23:00 监控离线的 10 秒盲区，取得备用钥匙进入展室。',
      },
    ],
  },
  truth: {
    culpritId: 'sus_liwei',
    culpritMotive:
      '李伟欠下赌场 50 万元赌债，三日期限将至。他深知"碧玉蟠龙佩"价值逾千万，且熟悉展室与保险柜的安保——一场监守自盗的计划由此而生。',
    method:
      '李伟利用 23:00 雷击导致的 10 秒监控盲区，从书房保险柜取出展室备用钥匙（密码只有他与陈志远知道），用钥匙打开展室门，取走玉佩。随后他从内侧击碎展柜玻璃，伪造外部闯入的假象，并穿上偷来的 42 码鞋踩出湿脚印嫁祸外人。撤离时，他西装内衬的丝质纤维被碎玻璃挂下，袖口内侧也沾上了玻璃屑。',
    keyEvidenceIds: [
      'ev_broken_glass',
      'ev_locked_window',
      'ev_silk_fiber',
      'ev_glass_dust_on_sleeve',
      'ev_safe_key_access',
      'ev_gambling_debt',
      'ev_cook_testimony',
      'ev_monitor_blackout',
    ],
    sequence: [
      '22:30，陈志远回书房，展室钥匙随身带走。',
      '23:00，雷击导致灯光闪烁、监控离线 10 秒。李伟趁此空档从书房保险柜取出展室备用钥匙。',
      '李伟用备用钥匙进入展室，取走"碧玉蟠龙佩"。',
      '为掩盖"钥匙开门"的痕迹，他从展柜内侧击碎玻璃，伪造外人破窗而入的假象。',
      '他穿上偷来的 42 码鞋，在窗边踩出湿脚印，进一步嫁祸"外部闯入者"。',
      '撤离时，西装内衬的丝质纤维被碎玻璃挂下，袖口内侧沾上玻璃屑——这成了他无法抵赖的物证。',
      '23:15，展室警报（玻璃破碎触发）响起，众人赶到，玉佩已不翼而飞。',
      '李伟将玉佩藏于宅邸外的预定地点，待风声过后再取出销赃。',
    ],
  },
};
