/* ═══════════════════════════════════════
   role.js — 角色创建系统
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  const STORAGE_KEY = 'mono_roles';
  let editingId = null; // 正在编辑的角色ID

  /* ─── 工具 ─── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.add('hidden'), 2000);
  }

  /* ─── 折叠手风琴 ─── */
  function initSections() {
    $$('.role-sec-hd').forEach(hd => {
      hd.addEventListener('click', () => {
        hd.parentElement.classList.toggle('open');
      });
    });
  }

  /* ─── 自定义下拉联动 ─── */
  function initCustomSelects() {
    const pairs = [
      ['r-persona-breaktype', 'r-persona-breakcustom'],
      ['r-beh-danger', 'r-beh-dangercustom']
    ];
    pairs.forEach(([selId, inputId]) => {
      const sel = $('#' + selId);
      const inp = $('#' + inputId);
      if (!sel || !inp) return;
      sel.addEventListener('change', () => {
        inp.style.display = sel.value === '自定义' ? 'block' : 'none';
      });
    });
  }

  /* ─── 头像上传 ─── */
  function initAvatar() {
    const wrap = $('#roleAvatarUpload');
    const preview = $('#roleAvatarPreview');
    const input = $('#roleAvatarInput');
    if (!wrap || !input) return;

    wrap.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" alt="avatar">`;
        preview.dataset.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ─── 动态卡片：关系人 ─── */
  function createRelationCard(data) {
    data = data || {};
    const card = document.createElement('div');
    card.className = 'role-dyn-card';
    card.innerHTML = `
      <button class="role-dyn-del" type="button">×</button>
      <div class="form-group"><label>名字</label><input type="text" class="rel-name" value="${data.name || ''}"></div>
      <div class="form-group"><label>关系</label><input type="text" class="rel-relation" value="${data.relation || ''}"></div>
      <div class="form-group"><label>表面态度</label><input type="text" class="rel-surface" value="${data.surface || ''}"></div>
      <div class="form-group"><label>真实态度</label><input type="text" class="rel-true" value="${data.true_ || ''}"></div>
      <div class="form-group"><label>态度变化轨迹</label><textarea class="role-ta rel-trajectory" rows="2">${data.trajectory || ''}</textarea></div>
      <div class="form-group"><label>专属称呼</label><input type="text" class="rel-names" value="${data.exclusiveNames || ''}"></div>
      <div class="form-group"><label>绝对不会对TA做的事</label><input type="text" class="rel-never" value="${data.neverDo || ''}"></div>
    `;
    card.querySelector('.role-dyn-del').addEventListener('click', () => card.remove());
    return card;
  }

  /* ─── 动态卡片：示例对话 ─── */
  function createExampleCard(data) {
    data = data || {};
    const card = document.createElement('div');
    card.className = 'role-dyn-card';
    card.innerHTML = `
      <button class="role-dyn-del" type="button">×</button>
      <div class="form-group"><label>场景类型</label>
        <select class="ex-type">
          <option value="日常对话" ${data.sceneType === '日常对话' ? 'selected' : ''}>日常对话</option>
          <option value="冲突/吵架" ${data.sceneType === '冲突/吵架' ? 'selected' : ''}>冲突 / 吵架</option>
          <option value="亲密/暧昧" ${data.sceneType === '亲密/暧昧' ? 'selected' : ''}>亲密 / 暧昧</option>
          <option value="危机/战斗" ${data.sceneType === '危机/战斗' ? 'selected' : ''}>危机 / 战斗</option>
          <option value="自定义" ${data.sceneType === '自定义' ? 'selected' : ''}>自定义</option>
        </select>
      </div>
      <div class="form-group"><label>场景简述</label><input type="text" class="ex-desc" value="${data.sceneDesc || ''}"></div>
      <div class="form-group"><label>User 说</label><textarea class="role-ta ex-user" rows="2">${data.userSays || ''}</textarea></div>
      <div class="form-group"><label>Char 回应</label><textarea class="role-ta ex-char" rows="4">${data.charResponds || ''}</textarea></div>
    `;
    card.querySelector('.role-dyn-del').addEventListener('click', () => card.remove());
    return card;
  }

  /* ─── 动态卡片：开场白 ─── */
  function createGreetingCard(data) {
    data = data || {};
    const card = document.createElement('div');
    card.className = 'role-dyn-card';
    card.innerHTML = `
      <button class="role-dyn-del" type="button">×</button>
      <div class="form-group"><label>场景名称</label><input type="text" class="gr-name" value="${data.scenarioName || ''}"></div>
      <div class="form-group"><label>场景前提</label><textarea class="role-ta gr-premise" rows="2">${data.premise || ''}</textarea></div>
      <div class="form-group"><label>开场白正文</label><textarea class="role-ta gr-text" rows="4">${data.text || ''}</textarea></div>
    `;
    card.querySelector('.role-dyn-del').addEventListener('click', () => card.remove());
    return card;
  }

  /* ─── 动态卡片：世界书条目 ─── */
  function createLoreCard(data) {
    data = data || {};
    const card = document.createElement('div');
    card.className = 'role-dyn-card';
    card.innerHTML = `
      <button class="role-dyn-del" type="button">×</button>
      <div class="form-group"><label>触发关键词</label><input type="text" class="lo-keyword" value="${data.keyword || ''}"></div>
      <div class="form-group"><label>注入内容</label><textarea class="role-ta lo-content" rows="3">${data.content || ''}</textarea></div>
      <div class="form-group"><label>注入方式</label>
        <select class="lo-mode">
          <option value="触发时注入" ${data.mode === '触发时注入' ? 'selected' : ''}>仅当关键词出现时注入</option>
          <option value="始终注入" ${data.mode === '始终注入' ? 'selected' : ''}>始终注入</option>
        </select>
      </div>
    `;
    card.querySelector('.role-dyn-del').addEventListener('click', () => card.remove());
    return card;
  }

  /* ─── 初始化动态添加按钮 ─── */
  function initDynamic() {
    $('#addRelationBtn')?.addEventListener('click', () => {
      $('#relationsContainer').appendChild(createRelationCard());
    });
    $('#addExampleBtn')?.addEventListener('click', () => {
      $('#examplesContainer').appendChild(createExampleCard());
    });
    $('#addGreetingBtn')?.addEventListener('click', () => {
      $('#greetingsContainer').appendChild(createGreetingCard());
    });
    $('#addLoreBtn')?.addEventListener('click', () => {
      $('#loreContainer').appendChild(createLoreCard());
    });
  }

  /* ─── 收集表单数据 ─── */
  function collectData() {
    const val = id => ($('#' + id)?.value || '').trim();

    // 关系人
    const relations = $$('#relationsContainer .role-dyn-card').map(card => ({
      name: $('.rel-name', card)?.value || '',
      relation: $('.rel-relation', card)?.value || '',
      surface: $('.rel-surface', card)?.value || '',
      true_: $('.rel-true', card)?.value || '',
      trajectory: $('.rel-trajectory', card)?.value || '',
      exclusiveNames: $('.rel-names', card)?.value || '',
      neverDo: $('.rel-never', card)?.value || ''
    }));

    // 示例对话
    const examples = $$('#examplesContainer .role-dyn-card').map(card => ({
      sceneType: $('.ex-type', card)?.value || '',
      sceneDesc: $('.ex-desc', card)?.value || '',
      userSays: $('.ex-user', card)?.value || '',
      charResponds: $('.ex-char', card)?.value || ''
    }));

    // 开场白
    const greetings = $$('#greetingsContainer .role-dyn-card').map(card => ({
      scenarioName: $('.gr-name', card)?.value || '',
      premise: $('.gr-premise', card)?.value || '',
      text: $('.gr-text', card)?.value || ''
    }));

    // 世界书
    const worldBook = $$('#loreContainer .role-dyn-card').map(card => ({
      keyword: $('.lo-keyword', card)?.value || '',
      content: $('.lo-content', card)?.value || '',
      mode: $('.lo-mode', card)?.value || '触发时注入'
    }));

    const breakType = val('r-persona-breaktype');

    return {
      id: editingId || uid(),
      avatar: $('#roleAvatarPreview')?.dataset.src || '',
      basic: {
        name: val('r-name'),
        gender: val('r-gender'),
        age: val('r-age'),
        surfaceIdentity: val('r-identity-surface'),
        hiddenIdentity: val('r-identity-hidden'),
        socialPosition: val('r-identity-social')
      },
      appearance: {
        build: val('r-build'),
        face: val('r-face'),
        hair: val('r-hair'),
        marks: val('r-marks'),
        clothing: val('r-clothing'),
        aura: val('r-aura')
      },
      personality: {
        summary: val('r-persona-sum'),
        defaultAttitude: val('r-persona-default'),
        breakpoint: val('r-persona-break'),
        breakdownType: breakType === '自定义' ? val('r-persona-breakcustom') : breakType,
        detail: val('r-persona-detail')
      },
      speech: {
        tempo: val('r-speech-tempo'),
        catchphrase: val('r-speech-catchphrase'),
        toStrangers: val('r-speech-stranger'),
        toLoved: val('r-speech-loved'),
        whenAngry: val('r-speech-angry'),
        neverSays: val('r-speech-never'),
        sampleLines: val('r-speech-sample')
      },
      behavior: {
        alone: val('r-beh-alone'),
        vsAuthority: val('r-beh-authority'),
        vsWeak: val('r-beh-weak'),
        dangerResponse: val('r-beh-danger') === '自定义' ? val('r-beh-dangercustom') : val('r-beh-danger'),
        antiTrope: val('r-beh-antitrope')
      },
      relationships: relations,
      background: {
        childhood: val('r-bg-childhood'),
        shaping: val('r-bg-shaping'),
        taboo: val('r-bg-taboo'),
        precious: val('r-bg-precious')
      },
      innerConflict: {
        desire: val('r-cf-desire'),
        fear: val('r-cf-fear'),
        contradiction: val('r-cf-contradiction'),
        status: val('r-cf-status'),
        elaboration: val('r-cf-elaboration')
      },
      examples: examples,
      greetings: greetings,
      writingRules: {
        pov: val('r-rule-pov'),
        lengthPref: parseInt($('#r-rule-length')?.value || '50'),
        contentLevel: val('r-rule-rating'),
        behaviorAnchors: val('r-rule-anchors'),
        antiTrope: val('r-rule-antitrope'),
        postInstructions: val('r-rule-post')
      },
      worldBook: worldBook,
      createdAt: editingId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /* ─── 填充表单（编辑时） ─── */
  function fillForm(role) {
    const set = (id, v) => { const el = $('#' + id); if (el) el.value = v || ''; };

    // 头像
    const preview = $('#roleAvatarPreview');
    if (role.avatar) {
      preview.innerHTML = `<img src="${role.avatar}" alt="avatar">`;
      preview.dataset.src = role.avatar;
    }

    // 基础
    set('r-name', role.basic?.name);
    set('r-gender', role.basic?.gender);
    set('r-age', role.basic?.age);
    set('r-identity-surface', role.basic?.surfaceIdentity);
    set('r-identity-hidden', role.basic?.hiddenIdentity);
    set('r-identity-social', role.basic?.socialPosition);

    // 外貌
    set('r-build', role.appearance?.build);
    set('r-face', role.appearance?.face);
    set('r-hair', role.appearance?.hair);
    set('r-marks', role.appearance?.marks);
    set('r-clothing', role.appearance?.clothing);
    set('r-aura', role.appearance?.aura);

    // 性格
    set('r-persona-sum', role.personality?.summary);
    set('r-persona-default', role.personality?.defaultAttitude);
    set('r-persona-break', role.personality?.breakpoint);
    // 判断是否是预设选项
    const presetBreak = ['暴怒爆发型', '安静变冷型', '压抑隐忍型'];
    if (presetBreak.includes(role.personality?.breakdownType)) {
      set('r-persona-breaktype', role.personality.breakdownType);
    } else if (role.personality?.breakdownType) {
      set('r-persona-breaktype', '自定义');
      set('r-persona-breakcustom', role.personality.breakdownType);
      $('#r-persona-breakcustom').style.display = 'block';
    }
    set('r-persona-detail', role.personality?.detail);

    // 说话
    set('r-speech-tempo', role.speech?.tempo);
    set('r-speech-catchphrase', role.speech?.catchphrase);
    set('r-speech-stranger', role.speech?.toStrangers);
    set('r-speech-loved', role.speech?.toLoved);
    set('r-speech-angry', role.speech?.whenAngry);
    set('r-speech-never', role.speech?.neverSays);
    set('r-speech-sample', role.speech?.sampleLines);

    // 行为
    set('r-beh-alone', role.behavior?.alone);
    set('r-beh-authority', role.behavior?.vsAuthority);
    set('r-beh-weak', role.behavior?.vsWeak);
    const presetDanger = ['正面迎上', '冷静分析', '保护身边的人'];
    if (presetDanger.includes(role.behavior?.dangerResponse)) {
      set('r-beh-danger', role.behavior.dangerResponse);
    } else if (role.behavior?.dangerResponse) {
      set('r-beh-danger', '自定义');
      set('r-beh-dangercustom', role.behavior.dangerResponse);
      $('#r-beh-dangercustom').style.display = 'block';
    }
    set('r-beh-antitrope', role.behavior?.antiTrope);

    // 关系人
    const relC = $('#relationsContainer');
    relC.innerHTML = '';
    (role.relationships || []).forEach(r => relC.appendChild(createRelationCard(r)));

    // 过往
    set('r-bg-childhood', role.background?.childhood);
    set('r-bg-shaping', role.background?.shaping);
    set('r-bg-taboo', role.background?.taboo);
    set('r-bg-precious', role.background?.precious);

    // 冲突
    set('r-cf-desire', role.innerConflict?.desire);
    set('r-cf-fear', role.innerConflict?.fear);
    set('r-cf-contradiction', role.innerConflict?.contradiction);
    set('r-cf-status', role.innerConflict?.status);
    set('r-cf-elaboration', role.innerConflict?.elaboration);

    // 示例
    const exC = $('#examplesContainer');
    exC.innerHTML = '';
    (role.examples || []).forEach(e => exC.appendChild(createExampleCard(e)));

    // 开场白
    const grC = $('#greetingsContainer');
    grC.innerHTML = '';
    (role.greetings || []).forEach(g => grC.appendChild(createGreetingCard(g)));

    // 写作规则
    set('r-rule-pov', role.writingRules?.pov);
    if ($('#r-rule-length')) $('#r-rule-length').value = role.writingRules?.lengthPref ?? 50;
    set('r-rule-rating', role.writingRules?.contentLevel);
    set('r-rule-anchors', role.writingRules?.behaviorAnchors);
    set('r-rule-antitrope', role.writingRules?.antiTrope);
    set('r-rule-post', role.writingRules?.postInstructions);

    // 世界书
    const loC = $('#loreContainer');
    loC.innerHTML = '';
    (role.worldBook || []).forEach(l => loC.appendChild(createLoreCard(l)));
  }

  /* ─── 清空表单 ─── */
  function clearForm() {
    editingId = null;
    $$('#roleCreatePanel input[type="text"], #roleCreatePanel textarea, #roleCreatePanel select').forEach(el => {
      if (el.type === 'file' || el.type === 'range' || el.type === 'checkbox') return;
      el.value = el.tagName === 'SELECT' ? el.options[0]?.value || '' : '';
    });
    if ($('#r-rule-length')) $('#r-rule-length').value = 50;
    $('#r-persona-breakcustom').style.display = 'none';
    $('#r-beh-dangercustom').style.display = 'none';
    const preview = $('#roleAvatarPreview');
    preview.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    delete preview.dataset.src;
    ['relationsContainer', 'examplesContainer', 'greetingsContainer', 'loreContainer'].forEach(id => {
      const c = $('#' + id); if (c) c.innerHTML = '';
    });
  }

  /* ─── 存储 ─── */
  function loadRoles() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function saveRoles(roles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }

  /* ─── 渲染列表 ─── */
  function renderList() {
    const list = $('#savedRolesList');
    if (!list) return;
    const roles = loadRoles();
    if (!roles.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-secondary,#888);font-size:13px;">暂无保存的角色</p>';
      return;
    }
    list.innerHTML = roles.map(r => `
      <div class="role-saved-item" data-id="${r.id}">
        <div class="role-saved-avatar">
          ${r.avatar ? `<img src="${r.avatar}" alt="">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`}
        </div>
        <div class="role-saved-info">
          <div class="role-saved-name">${r.basic?.name || '未命名'}</div>
          <div class="role-saved-sub">${r.basic?.surfaceIdentity || ''} ${r.personality?.summary ? '· ' + r.personality.summary : ''}</div>
        </div>
        <div class="role-saved-actions">
          <button class="btn btn-outline btn-sm role-edit-btn" data-id="${r.id}" type="button">编辑</button>
          <button class="btn btn-outline btn-sm role-del-btn" data-id="${r.id}" type="button" style="color:#d33;border-color:#d33;">删除</button>
        </div>
      </div>
    `).join('');

    // 绑定事件
    $$('.role-edit-btn', list).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const role = loadRoles().find(r => r.id === btn.dataset.id);
        if (!role) return;
        editingId = role.id;
        fillForm(role);
        toast('已载入，修改后点保存');
        // 滚到顶部
        $('#roleCreatePanel .panel-body')?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    $$('.role-del-btn', list).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('确定删除这个角色？')) return;
        const roles = loadRoles().filter(r => r.id !== btn.dataset.id);
        saveRoles(roles);
        renderList();
        toast('已删除');
      });
    });
  }

  /* ─── 保存 ─── */
  function handleSave() {
    const data = collectData();
    if (!data.basic.name) { toast('请至少填写角色名字'); return; }

    let roles = loadRoles();
    const idx = roles.findIndex(r => r.id === data.id);
    if (idx >= 0) {
      data.createdAt = roles[idx].createdAt;
      roles[idx] = data;
    } else {
      roles.unshift(data);
    }
    saveRoles(roles);
    editingId = null;
    clearForm();
    renderList();
    toast('角色已保存');
  }

  /* ─── 导出 ─── */
  function handleExport() {
    const data = collectData();
    if (!data.basic.name) { toast('请先填写角色'); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (data.basic.name || 'role') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('已导出');
  }

  /* ─── 导入 ─── */
  function handleImport() {
    $('#roleImportFile')?.click();
  }
  function onImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.basic?.name) { toast('无效的角色文件'); return; }
        data.id = uid(); // 给新ID防冲突
        editingId = null;
        fillForm(data);
        toast('已导入，可修改后保存');
      } catch { toast('文件解析失败'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  /* ─── 组装 System Prompt（供 chat.js 调用） ─── */
  window.buildRolePrompt = function (roleData) {
    if (!roleData) return '';
    const r = roleData;
    let p = '';

    // 基础
    if (r.basic?.name) {
      p += `# 角色基础信息\n`;
      p += `姓名：${r.basic.name}\n`;
      if (r.basic.gender) p += `性别：${r.basic.gender}\n`;
      if (r.basic.age) p += `年龄：${r.basic.age}\n`;
      if (r.basic.surfaceIdentity) p += `表面身份：${r.basic.surfaceIdentity}\n`;
      if (r.basic.hiddenIdentity) p += `隐藏身份：${r.basic.hiddenIdentity}\n`;
      if (r.basic.socialPosition) p += `社会位置：${r.basic.socialPosition}\n`;
      p += '\n';
    }

    // 外貌
    const ap = r.appearance;
    if (ap && (ap.build || ap.face || ap.hair)) {
      p += `## 外貌\n`;
      if (ap.build) p += `- 身材：${ap.build}\n`;
      if (ap.face) p += `- 面部：${ap.face}\n`;
      if (ap.hair) p += `- 发型：${ap.hair}\n`;
      if (ap.marks) p += `- 标志特征：${ap.marks}\n`;
      if (ap.clothing) p += `- 穿着：${ap.clothing}\n`;
      if (ap.aura) p += `- 气质：${ap.aura}\n`;
      p += '\n';
    }

    // 性格
    const pe = r.personality;
    if (pe && (pe.summary || pe.detail)) {
      p += `## 性格内核\n`;
      if (pe.summary) p += `性格底色：${pe.summary}\n`;
      if (pe.defaultAttitude) p += `默认态度：${pe.defaultAttitude}\n`;
      if (pe.breakpoint) p += `破防触发：${pe.breakpoint}\n`;
      if (pe.breakdownType) p += `破防反应：${pe.breakdownType}\n`;
      if (pe.detail) p += `${pe.detail}\n`;
      p += '\n';
    }

    // 说话
    const sp = r.speech;
    if (sp && (sp.tempo || sp.sampleLines)) {
      p += `## 说话方式\n`;
      if (sp.tempo) p += `语速语气：${sp.tempo}\n`;
      if (sp.catchphrase) p += `口头禅：${sp.catchphrase}\n`;
      if (sp.toStrangers) p += `对陌生人：${sp.toStrangers}\n`;
      if (sp.toLoved) p += `对在乎的人：${sp.toLoved}\n`;
      if (sp.whenAngry) p += `生气时：${sp.whenAngry}\n`;
      if (sp.neverSays) p += `绝对不会说：${sp.neverSays}\n`;
      if (sp.sampleLines) p += `示范台词：\n${sp.sampleLines}\n`;
      p += '\n';
    }

    // 行为
    const bh = r.behavior;
    if (bh && (bh.alone || bh.antiTrope)) {
      p += `## 行为模式\n`;
      if (bh.alone) p += `独处时：${bh.alone}\n`;
      if (bh.vsAuthority) p += `面对权威：${bh.vsAuthority}\n`;
      if (bh.vsWeak) p += `面对弱者：${bh.vsWeak}\n`;
      if (bh.dangerResponse) p += `遇到危险：${bh.dangerResponse}\n`;
      if (bh.antiTrope) p += `反套路行为：${bh.antiTrope}\n`;
      p += '\n';
    }

    // 关系
    if (r.relationships?.length) {
      p += `## 关系网\n`;
      r.relationships.forEach(rel => {
        if (!rel.name) return;
        p += `### ${rel.name}\n`;
        if (rel.relation) p += `关系：${rel.relation}\n`;
        if (rel.surface) p += `表面态度：${rel.surface}\n`;
        if (rel.true_) p += `真实态度：${rel.true_}\n`;
        if (rel.trajectory) p += `变化轨迹：${rel.trajectory}\n`;
        if (rel.exclusiveNames) p += `专属称呼：${rel.exclusiveNames}\n`;
        if (rel.neverDo) p += `绝不会对TA做：${rel.neverDo}\n`;
        p += '\n';
      });
    }

    // 过往
    const bg = r.background;
    if (bg && (bg.childhood || bg.shaping)) {
      p += `## 过往经历\n`;
      if (bg.childhood) p += `关键事件：${bg.childhood}\n`;
      if (bg.shaping) p += `性格塑造：${bg.shaping}\n`;
      if (bg.taboo) p += `禁忌话题：${bg.taboo}\n`;
      if (bg.precious) p += `珍视记忆：${bg.precious}\n`;
      p += '\n';
    }

    // 内在冲突
    const cf = r.innerConflict;
    if (cf && (cf.desire || cf.contradiction)) {
      p += `## 内在冲突\n`;
      if (cf.desire) p += `核心欲望：${cf.desire}\n`;
      if (cf.fear) p += `核心恐惧：${cf.fear}\n`;
      if (cf.contradiction) p += `核心矛盾：${cf.contradiction}\n`;
      if (cf.status) p += `矛盾状态：${cf.status}\n`;
      if (cf.elaboration) p += `补充：${cf.elaboration}\n`;
      p += '\n';
    }

    // 示例对话
    if (r.examples?.length) {
      p += `## 示例对话\n`;
      r.examples.forEach(ex => {
        p += `<START>\n`;
        if (ex.sceneDesc) p += `[场景：${ex.sceneDesc}]\n`;
        if (ex.userSays) p += `墨墨: ${ex.userSays}\n`;
        if (ex.charResponds) p += `Claude: ${ex.charResponds}\n`;
        p += '\n';
      });
    }

    // 写作规则
    const wr = r.writingRules;
    if (wr && (wr.behaviorAnchors || wr.antiTrope || wr.postInstructions)) {
      p += `## 写作规则\n`;
      if (wr.pov) p += `叙事视角：${wr.pov}\n`;
      if (wr.contentLevel) p += `内容尺度：${wr.contentLevel}\n`;
      if (wr.behaviorAnchors) p += `\n### 行为锚定\n${wr.behaviorAnchors}\n`;
      if (wr.antiTrope) p += `\n### 反套路规则\n${wr.antiTrope}\n`;
      p += '\n';
    }

    return p;
  };

  /* 获取后置指令（供 chat.js 每轮注入） */
  window.getRolePostInstructions = function (roleData) {
    return roleData?.writingRules?.postInstructions || '';
  };

  /* 获取世界书条目（供 chat.js 按关键词匹配注入） */
  window.getRoleWorldBook = function (roleData) {
    return roleData?.worldBook || [];
  };

  /* ─── 初始化 ─── */
  function init() {
    initSections();
    initCustomSelects();
    initAvatar();
    initDynamic();

    $('#roleSaveBtn')?.addEventListener('click', handleSave);
    $('#roleExportBtn')?.addEventListener('click', handleExport);
    $('#roleImportBtn')?.addEventListener('click', handleImport);
    $('#roleImportFile')?.addEventListener('change', onImportFile);

    renderList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
