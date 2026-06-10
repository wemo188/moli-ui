
(function(){
'use strict';
var App=window.App;if(!App)return;

var DB_NAME='GlobalFontDB';
var STORE_NAME='fontFiles';

var BUILTIN=[
  {name:'系统默认',family:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'},
  {name:'霞鹜文楷',family:"'LXGW WenKai',serif"},
  {name:'思源宋体',family:'"Noto Serif SC",serif'},
  {name:'思源黑体',family:'"Noto Sans SC",sans-serif'},
  {name:'站酷小薇',family:'"ZCOOL XiaoWei",serif'},
  {name:'马善政楷',family:'"Ma Shan Zheng",cursive'}
];

var DEF_CFG={selected:'系统默认',selectedEn:'',selectedZh:'系统默认'};
var PREVIEW_CN='遇你，如春水映梨花。';
var PREVIEW_EN='Meet you like spring water reflecting pear flower.';

var _db=null;
var _state={tab:'zh',zh:'系统默认',en:''};
/* ★ 记录当前已加载的文件字体名，用于释放 */
var _loadedFileFonts={};

var CATEGORY_LABELS = { zh: '中文', en: '英文', both: '通用' };

function openDB(cb){
  try{
    var req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'name'});};
    req.onsuccess=function(e){_db=e.target.result;if(cb)cb();};
    req.onerror=function(){if(cb)cb();};
  }catch(e){if(cb)cb();}
}

function saveFont(name,dataUrl,cb){
  if(!_db){if(cb)cb(false);return;}
  var tx=_db.transaction(STORE_NAME,'readwrite');
  tx.objectStore(STORE_NAME).put({name:name,dataUrl:dataUrl,time:Date.now()});
  tx.oncomplete=function(){if(cb)cb(true);};
  tx.onerror=function(){if(cb)cb(false);};
}

function deleteFont(name,cb){
  if(!_db){if(cb)cb();return;}
  var tx=_db.transaction(STORE_NAME,'readwrite');
  tx.objectStore(STORE_NAME).delete(name);
  tx.oncomplete=function(){if(cb)cb();};
  tx.onerror=function(){if(cb)cb();};
}

function getOneFont(name,cb){
  if(!_db){cb(null);return;}
  var tx=_db.transaction(STORE_NAME,'readonly');
  var req=tx.objectStore(STORE_NAME).get(name);
  req.onsuccess=function(){cb(req.result||null);};
  req.onerror=function(){cb(null);};
}

function loadFontFace(name,dataUrl){
  var ff=new FontFace(name,'url('+dataUrl+')',{weight:'100 900'});
  return ff.load().then(function(loaded){document.fonts.add(loaded);return true;}).catch(function(){return false;});
}

/* ★ 释放文件字体的缓存 */
function unloadFontFace(name){
  var toDelete=[];
  document.fonts.forEach(function(ff){
    if(ff.family===name || ff.family==="'"+name+"'") toDelete.push(ff);
  });
  toDelete.forEach(function(ff){
    try{document.fonts.delete(ff);}catch(e){}
  });
  delete _loadedFileFonts[name];
}

/* ★ 判断字体是文件上传的（没有 url 也没有 cssUrl） */
function isFileFont(f){
  return !f.url && !f.cssUrl;
}

/* ★ 只加载 URL 和 CSS 类型的字体，文件字体跳过 */
function loadNonFileFonts(list,cb){
  var i=0;
  function next(){
    if(i>=list.length){if(cb)cb();return;}
    var f=list[i];i++;
    // 文件字体跳过，等用户点击时才加载
    if(isFileFont(f)){next();return;}
    if(f.cssUrl){
      if(!document.querySelector('link[href="'+f.cssUrl+'"]')){
        var link=document.createElement('link');link.rel='stylesheet';link.href=f.cssUrl;document.head.appendChild(link);
      }
      next();return;
    }
    var already=false;
    document.fonts.forEach(function(ff){if(ff.family===f.name)already=true;});
    if(already){next();return;}
    if(f.url){
      var ff2=new FontFace(f.name,'url('+f.url+')',{weight:'100 900'});
      ff2.load().then(function(loaded){document.fonts.add(loaded);next();}).catch(function(){next();});
      return;
    }
    next();
  }
  next();
}

/* ★ 按需加载单个文件字体 */
function loadFileFontOnDemand(fontInfo,cb){
  if(!fontInfo || !isFileFont(fontInfo)){if(cb)cb();return;}
  // 已经加载过了
  if(_loadedFileFonts[fontInfo.name]){if(cb)cb();return;}
  // 检查 document.fonts 里是否已有
  var already=false;
  document.fonts.forEach(function(ff){if(ff.family===fontInfo.name)already=true;});
  if(already){_loadedFileFonts[fontInfo.name]=true;if(cb)cb();return;}
  // 从 IndexedDB 读取
  getOneFont(fontInfo.name,function(result){
    if(result&&result.dataUrl){
      loadFontFace(result.name,result.dataUrl).then(function(ok){
        if(ok) _loadedFileFonts[fontInfo.name]=true;
        if(cb)cb();
      }).catch(function(){if(cb)cb();});
    } else {
      if(cb)cb();
    }
  });
}

/* ★ 释放不再使用的文件字体 */
function releaseUnusedFileFonts(keepNames){
  var loaded=Object.keys(_loadedFileFonts);
  loaded.forEach(function(name){
    if(keepNames.indexOf(name)===-1){
      unloadFontFace(name);
    }
  });
}

var Font={
  config:{},
  customList:[],

  load:function(){
    Font.config=App.LS.get('fontConfig')||JSON.parse(JSON.stringify(DEF_CFG));
    if(!Font.config.selectedZh)Font.config.selectedZh=Font.config.selected||'系统默认';
    if(Font.config.selectedEn==null)Font.config.selectedEn='';
    Font.customList=App.LS.get('fontCustomList')||[];
    Font.customList.forEach(function(f){
      if(f.scale==null)f.scale=1;
      if(!f.category)f.category='both';
    });
  },

  save:function(){
    App.LS.set('fontConfig',Font.config);
    App.LS.set('fontCustomList',Font.customList);
  },

  getFamily:function(name){
    if(!name)return '';
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===name)return BUILTIN[i].family;}
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].family;}
    return '';
  },

  getScale:function(name){
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].scale||1;}
    return 1;
  },

  _getName:function(name){
    if(!name)return '跟随中文';
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===name)return BUILTIN[i].name;}
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].fileName||Font.customList[j].name;}
    return name;
  },

  _getInfo:function(name){
    if(!name)return null;
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j];}
    return null;
  },

  _combo:function(enName,zhName){
    var ef=Font.getFamily(enName);
    var zf=Font.getFamily(zhName)||BUILTIN[0].family;
    function stripGeneric(f){
      return f.replace(/,\s*(serif|sans-serif|cursive|monospace|fantasy)\s*$/i,'').trim();
    }
    var parts=[];
    if(ef)parts.push(stripGeneric(ef));
    parts.push(stripGeneric(zf));
    return parts.join(',')+',sans-serif';
  },

  loadByName:function(fontName,cb){
    if(!fontName){if(cb)cb();return;}
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===fontName){if(cb)cb();return;}}
    var info=Font._getInfo(fontName);
    if(!info){if(cb)cb();return;}
    if(isFileFont(info)){
      loadFileFontOnDemand(info,cb);
    } else {
      loadNonFileFonts([info],cb);
    }
  },

  loadByFamily:function(family,cb){
    if(!family){if(cb)cb();return;}
    var t=null;
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].family===family){t=Font.customList[j];break;}}
    if(!t){if(cb)cb();return;}
    Font.loadByName(t.name,cb);
  },

  /* ★ 应用字体时，按需加载文件字体并释放旧的 */
  apply:function(){
    var zhName=Font.config.selectedZh||'系统默认';
    var enName=Font.config.selectedEn||'';
    Font.config.selected=zhName;

    var keepNames=[];
    var zhInfo=Font._getInfo(zhName);
    var enInfo=Font._getInfo(enName);

    var toLoad=[];
    if(zhInfo && isFileFont(zhInfo)){toLoad.push(zhInfo);keepNames.push(zhInfo.name);}
    if(enInfo && isFileFont(enInfo)){toLoad.push(enInfo);keepNames.push(enInfo.name);}

    // 释放不再使用的文件字体
    releaseUnusedFileFonts(keepNames);

    function doApply(){
      var combo=Font._combo(enName,zhName);
      var scale=Font.getScale(zhName);
      document.body.style.fontFamily=combo;
      document.documentElement.style.setProperty('--font-scale',scale);
      var styleEl=document.getElementById('fontGlobalOverride');
      if(styleEl)styleEl.textContent='';
      setTimeout(function(){
        document.querySelectorAll('.bx-ribbon-tab').forEach(function(el){el.style.display='none';el.offsetHeight;el.style.display='';});
      },100);
    }

    if(toLoad.length===0){
      doApply();
    } else {
      var loaded=0;
      toLoad.forEach(function(info){
        loadFileFontOnDemand(info,function(){
          loaded++;
          if(loaded>=toLoad.length) doApply();
        });
      });
    }
  },

  open:function(){
    Font.load();
    var old=document.getElementById('fontFullPanel');
    if(old){old.classList.remove('hidden');old.classList.add('show');return;}
    _state.zh=Font.config.selectedZh||'系统默认';
    _state.en=Font.config.selectedEn||'';
    _state.tab='zh';
    var panel=document.createElement('div');
    panel.id='fontFullPanel';
    panel.className='font-fullpanel';
    // ★ 不再预加载全部字体，直接打开面板
    Font._build(panel);
    document.body.appendChild(panel);
    requestAnimationFrame(function(){panel.classList.add('show');});
    App.bindSwipeBack(panel,function(){Font.close();});
  },

  close:function(){
    var p=document.getElementById('fontFullPanel');
    if(!p)return;
    p.classList.remove('show');p.classList.add('hidden');
    setTimeout(function(){p.remove();},350);
  },

  _askCategory:function(fileName, cb){
    var overlay=document.createElement('div');
    overlay.className='bf-modal-overlay';
    overlay.innerHTML=
      '<div class="bf-modal-box">'+
        '<div style="font-size:15px;font-weight:700;color:#1a1a1a;text-align:center;margin-bottom:4px;">字体分类</div>'+
        '<div style="font-size:12px;color:#999;text-align:center;margin-bottom:14px;">'+App.esc(fileName)+'</div>'+
        '<button class="bf-modal-btn bf-modal-btn-primary" data-cat="zh" type="button">中文字体</button>'+
        '<button class="bf-modal-btn bf-modal-btn-primary" data-cat="en" type="button" style="background:#4a5a75;">英文字体</button>'+
        '<button class="bf-modal-btn bf-modal-btn-secondary" data-cat="both" type="button">通用（中英都用）</button>'+
        '<button class="bf-modal-btn bf-modal-btn-cancel" data-cat="cancel" type="button">取消</button>'+
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay){overlay.remove();cb(null);}});
    overlay.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var cat=btn.dataset.cat;
        overlay.remove();
        if(cat==='cancel'){cb(null);}
        else{cb(cat);}
      });
    });
  },

  _build:function(panel){
    var zhF=Font.getFamily(_state.zh)||BUILTIN[0].family;
    var enF=Font.getFamily(_state.en);
    var isSame=(_state.zh===(Font.config.selectedZh||'系统默认')&&_state.en===(Font.config.selectedEn||''));
    var active=_state.tab==='en'?_state.en:_state.zh;

    var listHtml='';
    BUILTIN.forEach(function(f){
      listHtml+='<div class="ft-item'+(active===f.name?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">'+
        '<div class="ft-item-preview" style="font-family:'+f.family+' !important">你好世界 Hello 123</div>'+
        '<div class="ft-item-name">'+App.esc(f.name)+'</div>'+
        '<div class="ft-item-check"></div>'+
      '</div>';
    });

    var customZh=Font.customList.filter(function(f){return f.category==='zh';});
    var customEn=Font.customList.filter(function(f){return f.category==='en';});
    var customBoth=Font.customList.filter(function(f){return !f.category||f.category==='both';});

    function buildCustomGroup(title,list){
      if(!list.length)return '';
      var html='<div class="hp-section-label" style="margin-top:14px;display:flex;align-items:center;gap:8px;">'+
        '<span>'+title+'</span>'+
        '<span style="font-size:11px;color:#bbb;font-weight:400;">'+list.length+'个</span>'+
      '</div>';
      list.forEach(function(f){
        var catTag=CATEGORY_LABELS[f.category]||'通用';
        var isFile=isFileFont(f);
        var isLoaded=_loadedFileFonts[f.name];
        // ★ 文件字体未加载时，预览文字用系统字体显示，加上提示标签
        var previewStyle=(!isFile || isLoaded)?'font-family:'+f.family+' !important':'';
        var loadTag=isFile && !isLoaded?'<span style="display:inline-block;margin-left:4px;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;background:rgba(255,180,0,.12);color:#b8860b;">点击加载</span>':'';
        html+='<div class="ft-custom-card'+(active===f.name?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">'+
          '<div class="ft-custom-top">'+
            '<div class="ft-item-preview" style="'+previewStyle+'">你好世界 Hello 123</div>'+
            '<div class="ft-item-name">'+
              App.esc(f.fileName||f.name)+loadTag+
              '<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:'+
                (f.category==='zh'?'rgba(201,112,107,.12);color:#c9706b':
                 f.category==='en'?'rgba(79,121,166,.12);color:#4f79a6':
                 'rgba(156,163,176,.12);color:#9ca3b0')+
              ';">'+catTag+'</span>'+
              (isFile?'<span style="display:inline-block;margin-left:4px;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;background:rgba(156,163,176,.1);color:#9ca3b0;">本地</span>':
                      '<span style="display:inline-block;margin-left:4px;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;background:rgba(79,166,79,.1);color:#5a9a5a;">URL</span>')+
            '</div>'+
            '<div class="ft-del-btn" data-del="'+App.escAttr(f.name)+'">'+
              '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'+
            '</div>'+
            '<div class="ft-item-check"></div>'+
          '</div>'+
        '</div>';
      });
      return html;
    }

    var customSection='';
    customSection+=buildCustomGroup('中文字体',customZh);
    customSection+=buildCustomGroup('英文字体',customEn);
    customSection+=buildCustomGroup('通用字体',customBoth);

    var enExtraOption='';
    if(_state.tab==='en'){
      enExtraOption='<div class="ft-item'+(!_state.en?' active':'')+'" data-fname="">'+
        '<div class="ft-item-preview">跟随中文字体</div>'+
        '<div class="ft-item-name">不单独设置</div>'+
        '<div class="ft-item-check"></div>'+
      '</div>';
    }

    panel.innerHTML=
      '<div class="bf-nav">'+
        '<button class="bf-back" id="ftClose" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span class="bf-nav-title">字体选择</span>'+
        '<div class="bf-nav-right"></div>'+
      '</div>'+
      '<div class="ft-live-preview">'+
        '<div class="ft-tab-row">'+
          '<button type="button" class="ft-tab'+(_state.tab==='zh'?' active':'')+'" data-t="zh">中文</button>'+
          '<button type="button" class="ft-tab'+(_state.tab==='en'?' active':'')+'" data-t="en">英文</button>'+
        '</div>'+
        '<div class="ft-live-preview-text">'+
          '<div id="ftPvCn" style="font-family:'+zhF+' !important">'+PREVIEW_CN+'</div>'+
          '<div id="ftPvEn" style="font-family:'+(enF||zhF)+' !important;font-size:16px;opacity:0.7;margin-top:6px;">'+PREVIEW_EN+'</div>'+
        '</div>'+
        '<div class="ft-slot-info">'+
          '<span class="ft-slot-tag'+(_state.tab==='zh'?' active':'')+'" id="ftTagZh">中：'+App.esc(Font._getName(_state.zh))+'</span>'+
          '<span class="ft-slot-tag'+(_state.tab==='en'?' active':'')+'" id="ftTagEn">英：'+App.esc(Font._getName(_state.en))+'</span>'+
        '</div>'+
        '<button type="button" class="ft-live-preview-btn'+(isSame?' disabled':'')+'" id="ftApply">'+(isSame?'当前全局':'应用为全局')+'</button>'+
      '</div>'+
      '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 20px 0;">'+
        '<div class="hp-upload" id="ftUpload">'+
          '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'+
          '上传字体文件'+
        '</div>'+
        '<input type="file" id="ftFile" accept=".ttf,.otf,.woff,.woff2" hidden>'+
        '<div class="hp-upload" id="ftUrl">'+
          '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'+
          'URL导入字体'+
        '</div>'+
        enExtraOption+
        customSection+
        '<div class="hp-section-label">内置字体</div>'+
        '<div class="ft-list">'+listHtml+'</div>'+
        '<div style="height:40px;"></div>'+
      '</div>';

    Font._bindEvents(panel);
  },

  _update:function(panel){
    var zhF=Font.getFamily(_state.zh)||BUILTIN[0].family;
    var enF=Font.getFamily(_state.en);
    var isSame=(_state.zh===(Font.config.selectedZh||'系统默认')&&_state.en===(Font.config.selectedEn||''));
    var cn=panel.querySelector('#ftPvCn');
    var en=panel.querySelector('#ftPvEn');
    if(cn)cn.setAttribute('style','font-family:'+zhF+' !important');
    if(en)en.setAttribute('style','font-family:'+(enF||zhF)+' !important;font-size:16px;opacity:0.7;margin-top:6px');
    var tzh=panel.querySelector('#ftTagZh');
    var ten=panel.querySelector('#ftTagEn');
    if(tzh){tzh.textContent='中：'+Font._getName(_state.zh);tzh.classList.toggle('active',_state.tab==='zh');}
    if(ten){ten.textContent='英：'+Font._getName(_state.en);ten.classList.toggle('active',_state.tab==='en');}
    var btn=panel.querySelector('#ftApply');
    if(btn){
      if(isSame){btn.classList.add('disabled');btn.textContent='当前全局';}
      else{btn.classList.remove('disabled');btn.textContent='应用为全局';}
    }
    var active=_state.tab==='en'?_state.en:_state.zh;
    panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
      el.classList.toggle('active',el.dataset.fname===active);
    });
  },

  _bindEvents:function(panel){
    panel.querySelector('#ftClose').addEventListener('click',function(){Font.close();});

    panel.querySelectorAll('.ft-tab').forEach(function(tab){
      tab.addEventListener('click',function(){
        _state.tab=tab.dataset.t;
        panel.querySelectorAll('.ft-tab').forEach(function(t){t.classList.toggle('active',t.dataset.t===_state.tab);});
        Font._build(panel);
      });
    });

    panel.querySelector('#ftApply').addEventListener('click',function(){
      Font.config.selectedZh=_state.zh;
      Font.config.selectedEn=_state.en;
      Font.save();
      Font.apply();
      Font._update(panel);
      App.showToast('已应用为全局字体');
    });

    panel.querySelector('#ftUpload').addEventListener('click',function(){panel.querySelector('#ftFile').click();});

    panel.querySelector('#ftUrl').addEventListener('click',function(){
      var url=prompt('输入字体URL（支持 .ttf/.woff2 或 CSS链接）：');
      if(!url||!url.trim())return;
      url=url.trim();
      if(url.match(/\.css(\?|$)/i)){
        var fn=prompt('输入 font-family 名称：');
        if(!fn||!fn.trim()){App.showToast('已取消');return;}
        fn=fn.trim();
        Font._askCategory(fn,function(cat){
          if(!cat)return;
          var link=document.createElement('link');link.rel='stylesheet';link.href=url;document.head.appendChild(link);
          var name='CSS_'+fn.replace(/\s+/g,'_')+'_'+Date.now();
          Font.customList.push({name:name,family:"'"+fn+"',serif",fileName:fn,scale:1,cssUrl:url,category:cat});
          Font.save();
          if(_state.tab==='en')_state.en=name;else _state.zh=name;
          Font._build(panel);
          App.showToast('已添加：'+fn);
        });
        return;
      }
      var m=url.match(/([^\/]+)\.(ttf|otf|woff2?)$/i);
      var raw=m?m[1]:'URLFont';
      Font._askCategory(raw,function(cat){
        if(!cat)return;
        App.showToast('加载中...');
        var name='Custom_'+raw.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_')+'_'+Date.now();
        var ff=new FontFace(name,'url('+url+')',{weight:'100 900'});
        ff.load().then(function(l){
          document.fonts.add(l);
          Font.customList.push({name:name,family:"'"+name+"',sans-serif",fileName:raw,scale:1,url:url,category:cat});
          Font.save();
          if(_state.tab==='en')_state.en=name;else _state.zh=name;
          Font._build(panel);
          App.showToast('已添加：'+raw);
        }).catch(function(){App.showToast('加载失败');});
      });
    });

    panel.querySelector('#ftFile').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var raw=file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_');
      e.target.value='';
      Font._askCategory(file.name,function(cat){
        if(!cat)return;
        App.showToast('加载中...');
        var name='Custom_'+raw+'_'+Date.now();
        var reader=new FileReader();
        reader.onload=function(ev){
          var dataUrl=ev.target.result;
          loadFontFace(name,dataUrl).then(function(ok){
            if(!ok){App.showToast('字体加载失败');return;}
            _loadedFileFonts[name]=true;
            saveFont(name,dataUrl,function(ok2){
              if(!ok2){App.showToast('保存失败');return;}
              Font.customList.push({name:name,family:"'"+name+"',sans-serif",fileName:file.name,scale:1,category:cat});
              Font.save();
              if(_state.tab==='en')_state.en=name;else _state.zh=name;
              Font._build(panel);
              App.showToast('已添加：'+file.name);
            });
          });
        };
        reader.readAsDataURL(file);
      });
    });

    /* ★ 点击字体项：文件字体按需加载，加载完刷新预览 */
    panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
      el.addEventListener('click',function(e){
        if(e.target.closest('.ft-del-btn'))return;
        var fname=el.dataset.fname;

        function doSelect(){
          if(_state.tab==='en')_state.en=fname;
          else _state.zh=fname;
          Font._update(panel);
        }

        // 空名字（跟随中文）或内置字体，直接选中
        if(!fname){doSelect();return;}
        for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===fname){doSelect();return;}}

        // 检查是否已加载
        var already=false;
        document.fonts.forEach(function(ff){if(ff.family===fname)already=true;});
        if(already){doSelect();return;}

        // 没加载过，按需加载
        Font.loadByName(fname,function(){
          doSelect();
          Font._build(panel);
        });
      });
    });

    panel.querySelectorAll('.ft-del-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var name=btn.dataset.del;if(!name)return;
        if(!confirm('删除这个字体？'))return;
        // 释放字体缓存
        unloadFontFace(name);
        deleteFont(name,function(){
          Font.customList=Font.customList.filter(function(f){return f.name!==name;});
          if(Font.config.selectedZh===name)Font.config.selectedZh='系统默认';
          if(Font.config.selectedEn===name)Font.config.selectedEn='';
          if(_state.zh===name)_state.zh='系统默认';
          if(_state.en===name)_state.en='';
          Font.save();Font.apply();
          Font._build(panel);
          App.showToast('已删除');
        });
      });
    });
  },

  render:function(panel){Font._build(panel);},

  init:function(){
    if(!document.querySelector('link[href*="lxgw-wenkai"]')){
      var lxgw=document.createElement('link');
      lxgw.rel='stylesheet';
      lxgw.href='https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css';
      document.head.appendChild(lxgw);
    }
    openDB(function(){
      Font.load();
      // ★ 初始化时只加载 URL/CSS 字体 + 当前选中的文件字体
      loadNonFileFonts(Font.customList,function(){
        // 当前选中的文件字体需要加载
        var zhInfo=Font._getInfo(Font.config.selectedZh);
        var enInfo=Font._getInfo(Font.config.selectedEn);
        var toLoad=[];
        if(zhInfo && isFileFont(zhInfo)) toLoad.push(zhInfo);
        if(enInfo && isFileFont(enInfo)) toLoad.push(enInfo);
        if(toLoad.length===0){
          Font.apply();
        } else {
          var done=0;
          toLoad.forEach(function(info){
            loadFileFontOnDemand(info,function(){
              done++;
              if(done>=toLoad.length) Font.apply();
            });
          });
        }
      });
    });
    App.font=Font;
  }
};

App.register('font',Font);
})();
