
(function(){
'use strict';
var App=window.App;if(!App)return;

var DB_NAME='GlobalFontDB';
var STORE_NAME='fontFiles';

var BUILTIN=[
  {name:'系统默认',family:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'},
  {name:'霞鹜文楷',family:'"LXGW WenKai",cursive'},
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

function loadAllCustomFonts(list,cb){
  var i=0;
  function next(){
    if(i>=list.length){if(cb)cb();return;}
    var f=list[i];i++;
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
    getOneFont(f.name,function(result){
      if(result&&result.dataUrl){loadFontFace(result.name,result.dataUrl).then(function(){next();}).catch(function(){next();});}
      else{next();}
    });
  }
  next();
}

var Font={
  config:{},
  customList:[],

  load:function(){
    Font.config=App.LS.get('fontConfig')||JSON.parse(JSON.stringify(DEF_CFG));
    if(!Font.config.selectedZh)Font.config.selectedZh=Font.config.selected||'系统默认';
    if(Font.config.selectedEn==null)Font.config.selectedEn='';
    Font.customList=App.LS.get('fontCustomList')||[];
    Font.customList.forEach(function(f){if(f.scale==null)f.scale=1;});
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
    if(!name)return '未设置';
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===name)return BUILTIN[i].name;}
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].fileName||Font.customList[j].name;}
    return name;
  },

  _combo:function(en,zh){
    var ef=Font.getFamily(en);
    var zf=Font.getFamily(zh)||BUILTIN[0].family;
    return ef?(ef+','+zf):zf;
  },

  loadByName:function(fontName,cb){
    if(!fontName){if(cb)cb();return;}
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===fontName){if(cb)cb();return;}}
    var already=false;
    document.fonts.forEach(function(ff){if(ff.family===fontName)already=true;});
    if(already){if(cb)cb();return;}
    var t=null;
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===fontName){t=Font.customList[j];break;}}
    if(!t){if(cb)cb();return;}
    if(t.cssUrl){
      if(!document.querySelector('link[href="'+t.cssUrl+'"]')){var lk=document.createElement('link');lk.rel='stylesheet';lk.href=t.cssUrl;document.head.appendChild(lk);}
      if(cb)cb();return;
    }
    if(t.url){
      var ff=new FontFace(t.name,'url('+t.url+')',{weight:'100 900'});
      ff.load().then(function(l){document.fonts.add(l);if(cb)cb();}).catch(function(){if(cb)cb();});
      return;
    }
    getOneFont(t.name,function(r){
      if(r&&r.dataUrl){loadFontFace(r.name,r.dataUrl).then(function(){if(cb)cb();}).catch(function(){if(cb)cb();});}
      else{if(cb)cb();}
    });
  },

  loadByFamily:function(family,cb){
    if(!family){if(cb)cb();return;}
    var t=null;
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].family===family){t=Font.customList[j];break;}}
    if(!t){if(cb)cb();return;}
    Font.loadByName(t.name,cb);
  },

  /* 核心：用 <style> 标签强制覆盖所有元素的 font-family */
  apply:function(){
    var combo=Font._combo(Font.config.selectedEn,Font.config.selectedZh);
    var scale=Font.getScale(Font.config.selectedZh);
    Font.config.selected=Font.config.selectedZh;

    var styleId='fontGlobalOverride';
    var styleEl=document.getElementById(styleId);
    if(!styleEl){
      styleEl=document.createElement('style');
      styleEl.id=styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent=
      'html,body,input,textarea,select,button,'+
      '.main-content,.main-content *,'+
      '.screen-page,.screen-page *,'+
      '.dock,.dock *,'+
      '.half-panel,.half-panel *,'+
      '.fullpage-panel,.fullpage-panel *,'+
      '.pixel-dialog,.pixel-dialog *,'+
      '.bx-w,.bx-w *,'+
      '.hl-avatar-unit,.hl-avatar-unit *,'+
      '#edenText,#edenCard,#edenCard *,'+
      '.eden-card,.eden-card *,'+
      '#calTimeRow,#calTimeRow *'+
      '{font-family:'+combo+' !important;}';

    document.documentElement.style.setProperty('--font-scale',scale);

    setTimeout(function(){
      document.querySelectorAll('.bx-ribbon-tab').forEach(function(el){el.style.display='none';el.offsetHeight;el.style.display='';});
    },100);
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

    loadAllCustomFonts(Font.customList,function(){
      Font._build(panel);
      document.body.appendChild(panel);
      requestAnimationFrame(function(){panel.classList.add('show');});
      App.bindSwipeBack(panel,function(){Font.close();});
    });
  },

  close:function(){
    var p=document.getElementById('fontFullPanel');
    if(!p)return;
    p.classList.remove('show');p.classList.add('hidden');
    setTimeout(function(){p.remove();},350);
  },

  _build:function(panel){
    var zhF=Font.getFamily(_state.zh)||BUILTIN[0].family;
    var enF=Font.getFamily(_state.en);
    var same=(_state.zh===(Font.config.selectedZh||'系统默认')&&_state.en===(Font.config.selectedEn||''));
    var active=_state.tab==='en'?_state.en:_state.zh;

    var listHtml='';
    BUILTIN.forEach(function(f){
      listHtml+='<div class="ft-item'+(active===f.name?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">'+
        '<div class="ft-item-preview" style="font-family:'+f.family+' !important">你好世界 Hello</div>'+
        '<div class="ft-item-name">'+App.esc(f.name)+'</div>'+
        '<div class="ft-item-check"></div>'+
      '</div>';
    });

    var customSection='';
    if(Font.customList.length){
      customSection='<div class="hp-section-label" style="margin-top:14px;">自定义字体</div>';
      Font.customList.forEach(function(f){
        customSection+='<div class="ft-custom-card'+(active===f.name?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">'+
          '<div class="ft-custom-top">'+
            '<div class="ft-item-preview" style="font-family:'+f.family+' !important">你好世界 Hello</div>'+
            '<div class="ft-item-name">'+App.esc(f.fileName||f.name)+'</div>'+
            '<div class="ft-del-btn" data-del="'+App.escAttr(f.name)+'">'+
              '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'+
            '</div>'+
            '<div class="ft-item-check"></div>'+
          '</div>'+
        '</div>';
      });
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
          '<div id="ftPvEn" style="font-family:'+(enF||zhF)+' !important;font-size:16px;opacity:0.7;margin-top:4px;">'+PREVIEW_EN+'</div>'+
        '</div>'+
        '<div class="ft-slot-info">'+
          '<span class="ft-slot-tag'+(_state.tab==='zh'?' active':'')+'" id="ftTagZh">中：'+App.esc(Font._getName(_state.zh))+'</span>'+
          '<span class="ft-slot-tag'+(_state.tab==='en'?' active':'')+'" id="ftTagEn">英：'+App.esc(Font._getName(_state.en))+'</span>'+
        '</div>'+
        '<button type="button" class="ft-live-preview-btn'+(same?' disabled':'')+'" id="ftApply">'+(same?'当前全局':'应用为全局')+'</button>'+
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

    var cn=panel.querySelector('#ftPvCn');
    var en=panel.querySelector('#ftPvEn');
    if(cn)cn.setAttribute('style','font-family:'+zhF+' !important');
    if(en)en.setAttribute('style','font-family:'+(enF||zhF)+' !important;font-size:16px;opacity:0.7;margin-top:4px');

    var tzh=panel.querySelector('#ftTagZh');
    var ten=panel.querySelector('#ftTagEn');
    if(tzh){tzh.textContent='中：'+Font._getName(_state.zh);tzh.classList.toggle('active',_state.tab==='zh');}
    if(ten){ten.textContent='英：'+Font._getName(_state.en);ten.classList.toggle('active',_state.tab==='en');}

    var same=(_state.zh===(Font.config.selectedZh||'系统默认')&&_state.en===(Font.config.selectedEn||''));
    var btn=panel.querySelector('#ftApply');
    if(btn){
      if(same){btn.classList.add('disabled');btn.textContent='当前全局';}
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
        Font._update(panel);
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
        var link=document.createElement('link');link.rel='stylesheet';link.href=url;document.head.appendChild(link);
        var fn=prompt('输入 font-family 名称：');
        if(!fn||!fn.trim()){App.showToast('已取消');return;}
        fn=fn.trim();
        var name='CSS_'+fn.replace(/\s+/g,'_')+'_'+Date.now();
        Font.customList.push({name:name,family:"'"+fn+"',serif",fileName:fn,scale:1,cssUrl:url});
        Font.save();
        if(_state.tab==='en')_state.en=name;else _state.zh=name;
        Font._build(panel);
        App.showToast('已添加：'+fn);
        return;
      }
      var m=url.match(/([^\/]+)\.(ttf|otf|woff2?)$/i);
      var raw=m?m[1]:'URLFont';
      var name='Custom_'+raw.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_')+'_'+Date.now();
      App.showToast('加载中...');
      var ff=new FontFace(name,'url('+url+')',{weight:'100 900'});
      ff.load().then(function(l){
        document.fonts.add(l);
        Font.customList.push({name:name,family:"'"+name+"',sans-serif",fileName:raw,scale:1,url:url});
        Font.save();
        if(_state.tab==='en')_state.en=name;else _state.zh=name;
        Font._build(panel);
        App.showToast('已添加：'+raw);
      }).catch(function(){App.showToast('加载失败');});
    });

    panel.querySelector('#ftFile').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var raw=file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_');
      var name='Custom_'+raw+'_'+Date.now();
      App.showToast('加载中...');
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target.result;
        loadFontFace(name,dataUrl).then(function(ok){
          if(!ok){App.showToast('字体加载失败');return;}
          saveFont(name,dataUrl,function(ok2){
            if(!ok2){App.showToast('保存失败');return;}
            Font.customList.push({name:name,family:"'"+name+"',sans-serif",fileName:file.name,scale:1});
            Font.save();
            if(_state.tab==='en')_state.en=name;else _state.zh=name;
            Font._build(panel);
            App.showToast('已添加：'+file.name);
          });
        });
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });

    panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
      el.addEventListener('click',function(e){
        if(e.target.closest('.ft-del-btn'))return;
        var fname=el.dataset.fname;
        if(_state.tab==='en')_state.en=fname;
        else _state.zh=fname;
        Font._update(panel);
      });
    });

    panel.querySelectorAll('.ft-del-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var name=btn.dataset.del;if(!name)return;
        if(!confirm('删除这个字体？'))return;
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
    openDB(function(){
      Font.load();
      var zh=Font.config.selectedZh||Font.config.selected||'系统默认';
      var en=Font.config.selectedEn||'';
      var toLoad=[];
      function isBuiltin(n){for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===n)return true;}return false;}
      if(!isBuiltin(zh)){for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===zh){toLoad.push(Font.customList[j]);break;}}}
      if(en&&!isBuiltin(en)){for(var k=0;k<Font.customList.length;k++){if(Font.customList[k].name===en){toLoad.push(Font.customList[k]);break;}}}
      loadAllCustomFonts(toLoad,function(){
        Font.config.selectedZh=zh;
        Font.config.selectedEn=en;
        Font.apply();
      });
    });
    App.font=Font;
  }
};

App.register('font',Font);
})();


