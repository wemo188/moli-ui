
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

var DEF_CFG={selected:'系统默认'};
var PREVIEW_TEXT='遇你，如春水映梨花。<br>Meet you like spring water reflecting pear flower';

var _db=null;
var _previewingName='';

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

function getAllFonts(cb){
  if(!_db){cb([]);return;}
  var tx=_db.transaction(STORE_NAME,'readonly');
  var req=tx.objectStore(STORE_NAME).getAll();
  req.onsuccess=function(){cb(req.result||[]);};
  req.onerror=function(){cb([]);};
}

function loadFontFace(name,dataUrl){
  var ff=new FontFace(name,'url('+dataUrl+')', { weight: '100 900' });
  return ff.load().then(function(loaded){document.fonts.add(loaded);return true;}).catch(function(){return false;});
}

var Font={
  config:{},
  customList:[],

  load:function(){
    Font.config=App.LS.get('fontConfig')||JSON.parse(JSON.stringify(DEF_CFG));
    Font.customList=App.LS.get('fontCustomList')||[];
    Font.customList.forEach(function(f){if(f.scale==null)f.scale=1;});
  },

  save:function(){
    App.LS.set('fontConfig',Font.config);
    App.LS.set('fontCustomList',Font.customList);
  },

  getFamily:function(name){
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===name)return BUILTIN[i].family;}
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].family;}
    return BUILTIN[0].family;
  },

  getScale:function(name){
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].scale||1;}
    return 1;
  },

  _getDisplayName:function(name){
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===name)return BUILTIN[i].name;}
    for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===name)return Font.customList[j].fileName||Font.customList[j].name;}
    return name;
  },

  _loadAllForPreview: function(cb){
    var customs = Font.customList.slice();
    var remaining = customs.length;
    if(!remaining){if(cb)cb();return;}

    customs.forEach(function(f){
      if(f.cssUrl){
        var existing = document.querySelector('link[href="'+f.cssUrl+'"]');
        if(!existing){
          var link=document.createElement('link');link.rel='stylesheet';link.href=f.cssUrl;document.head.appendChild(link);
        }
        remaining--;if(remaining<=0&&cb)cb();
        return;
      }
      if(f.url){
        var alreadyLoaded = false;
        document.fonts.forEach(function(ff){if(ff.family===f.name)alreadyLoaded=true;});
        if(alreadyLoaded){remaining--;if(remaining<=0&&cb)cb();return;}
        var ff2=new FontFace(f.name,'url('+f.url+')',{weight:'100 900'});
        ff2.load().then(function(loaded){document.fonts.add(loaded);}).catch(function(){}).finally(function(){remaining--;if(remaining<=0&&cb)cb();});
        return;
      }
      var alreadyLoaded2 = false;
      document.fonts.forEach(function(ff){if(ff.family===f.name)alreadyLoaded2=true;});
      if(alreadyLoaded2){remaining--;if(remaining<=0&&cb)cb();return;}
      getOneFont(f.name, function(result){
        if(result&&result.dataUrl){
          loadFontFace(result.name,result.dataUrl).then(function(){}).catch(function(){}).finally(function(){remaining--;if(remaining<=0&&cb)cb();});
        } else {remaining--;if(remaining<=0&&cb)cb();}
      });
    });
  },

  loadByName: function(fontName, cb){
    if(!fontName){if(cb)cb();return;}
    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===fontName){if(cb)cb();return;}}
    var alreadyLoaded = false;
    document.fonts.forEach(function(ff){
      if(ff.family === fontName || ff.family === "'"+fontName+"'") alreadyLoaded = true;
    });
    if(alreadyLoaded){if(cb)cb();return;}
    var target = null;
    for(var j=0;j<Font.customList.length;j++){
      if(Font.customList[j].name===fontName){target=Font.customList[j];break;}
    }
    if(!target){if(cb)cb();return;}
    if(target.cssUrl){
      var existing = document.querySelector('link[href="'+target.cssUrl+'"]');
      if(!existing){var link=document.createElement('link');link.rel='stylesheet';link.href=target.cssUrl;document.head.appendChild(link);}
      if(cb)cb();return;
    }
    if(target.url){
      var ff=new FontFace(target.name,'url('+target.url+')',{weight:'100 900'});
      ff.load().then(function(loaded){document.fonts.add(loaded);if(cb)cb();}).catch(function(){if(cb)cb();});
      return;
    }
    getOneFont(target.name, function(result){
      if(result&&result.dataUrl){
        loadFontFace(result.name,result.dataUrl).then(function(){if(cb)cb();}).catch(function(){if(cb)cb();});
      } else {if(cb)cb();}
    });
  },

  loadByFamily: function(family, cb){
    if(!family){if(cb)cb();return;}
    var target = null;
    for(var j=0;j<Font.customList.length;j++){
      if(Font.customList[j].family===family){target=Font.customList[j];break;}
    }
    if(!target){if(cb)cb();return;}
    Font.loadByName(target.name, cb);
  },

  _updatePreviewArea: function(panel, name){
    var family = Font.getFamily(name);
    var displayName = Font._getDisplayName(name);
    var isCurrentGlobal = (name === Font.config.selected);
    _previewingName = name;

    var textEl = panel.querySelector('.ft-live-preview-text');
    var labelEl = panel.querySelector('.ft-live-preview-label');
    var btnEl = panel.querySelector('#ftApplyBtn');

    if(textEl) textEl.style.fontFamily = family;
    if(labelEl) labelEl.textContent = '预览 · ' + displayName;
    if(btnEl){
      if(isCurrentGlobal){
        btnEl.classList.add('disabled');
        btnEl.textContent = '当前全局';
      } else {
        btnEl.classList.remove('disabled');
        btnEl.textContent = '应用为全局';
      }
    }
  },

  apply: function(){
    var name = Font.config.selected || '系统默认';
    var family = Font.getFamily(name);
    var scale = Font.getScale(name);
    document.body.style.fontFamily = family;
    document.documentElement.style.setProperty('--font-scale', scale);
    setTimeout(function(){
      var ribbons = document.querySelectorAll('.bx-ribbon-tab');
      ribbons.forEach(function(el){
        el.style.display = 'none';
        el.offsetHeight;
        el.style.display = '';
      });
    }, 100);
  },

  open:function(){
    Font.load();
    var old = document.getElementById('fontFullPanel');
    if(old) { old.classList.remove('hidden'); old.classList.add('show'); return; }

    var panel = document.createElement('div');
    panel.id = 'fontFullPanel';
    panel.className = 'font-fullpanel';

    _previewingName = Font.config.selected || '系统默认';

    Font._loadAllForPreview(function(){
      Font.render(panel);
      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });
      App.bindSwipeBack(panel, function(){ Font.close(); });
    });
  },

  close:function(){
    var panel = document.getElementById('fontFullPanel');
    if(!panel) return;
    panel.classList.remove('show');
    panel.classList.add('hidden');
    setTimeout(function(){ panel.remove(); }, 350);
  },

  render:function(panel){
    var selected=Font.config.selected||'系统默认';
    var previewName = _previewingName || selected;
    var previewFamily = Font.getFamily(previewName);
    var previewDisplayName = Font._getDisplayName(previewName);
    var isCurrentGlobal = (previewName === selected);

    var builtinHtml=BUILTIN.map(function(f){
      var isActive=previewName===f.name;
      return '<div class="ft-item'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">' +
        '<div class="ft-item-preview" style="font-family:'+f.family+' !important;">你好世界 Hello</div>' +
        '<div class="ft-item-name">'+App.esc(f.name)+'</div>' +
        '<div class="ft-item-check"></div>' +
      '</div>';
    }).join('');

    var customHtml='';
    if(Font.customList.length){
      customHtml=Font.customList.map(function(f){
        var isActive=previewName===f.name;
        return '<div class="ft-custom-card'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">' +
          '<div class="ft-custom-top">' +
          '<div class="ft-item-preview" style="font-family:'+f.family+' !important;">你好世界 Hello</div>' +
            '<div class="ft-item-name">'+App.esc(f.fileName||f.name)+'</div>' +
            '<div class="ft-del-btn" data-del="'+App.escAttr(f.name)+'">' +
              '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>' +
            '</div>' +
            '<div class="ft-item-check"></div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML=
      '<div class="bf-nav">' +
        '<button class="bf-back" id="ftCloseBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<span class="bf-nav-title">字体选择</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 20px 0;">' +
        '<div class="ft-live-preview" id="ftLivePreview">' +
          '<div class="ft-live-preview-label">预览 · '+App.esc(previewDisplayName)+'</div>' +
          '<div class="ft-live-preview-text" style="font-family:'+previewFamily+' !important;">'+PREVIEW_TEXT+'</div>' +
          '<button type="button" class="ft-live-preview-btn'+(isCurrentGlobal?' disabled':'')+'" id="ftApplyBtn">'+(isCurrentGlobal?'当前全局':'应用为全局')+'</button>' +
        '</div>' +
        '<div class="hp-upload" id="ftUploadArea">' +
          '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '上传字体文件' +
        '</div>' +
        '<input type="file" id="ftFileInput" accept=".ttf,.otf,.woff,.woff2" hidden>' +
        '<div class="hp-upload" id="ftUrlArea">' +
          '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
          'URL导入字体' +
        '</div>' +
        (customHtml ? '<div class="hp-section-label">自定义字体</div><div class="ft-list">' + customHtml + '</div>' : '') +
        '<div class="hp-section-label">内置字体</div>' +
        '<div class="ft-list">' + builtinHtml + '</div>' +
        '<div style="height:40px;"></div>' +
      '</div>';

    Font.bindEvents(panel);
  },

  bindEvents:function(panel){
    panel.querySelector('#ftCloseBtn').addEventListener('click',function(){Font.close();});

    /* 应用为全局按钮 */
    panel.querySelector('#ftApplyBtn').addEventListener('click',function(){
      if(!_previewingName) return;
      Font.config.selected = _previewingName;
      Font.save();
      Font.apply();
      Font._updatePreviewArea(panel, _previewingName);
      /* 更新列表高亮 */
      panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
        el.classList.toggle('active', el.dataset.fname === _previewingName);
      });
      App.showToast('已应用为全局字体');
    });

    panel.querySelector('#ftUploadArea').addEventListener('click',function(){panel.querySelector('#ftFileInput').click();});
    panel.querySelector('#ftUrlArea').addEventListener('click',function(){
      var url=prompt('输入字体URL（支持 .ttf/.woff2 或 CSS链接）：');
      if(!url||!url.trim())return;
      url=url.trim();

      if(url.match(/\.css(\?|$)/i)){
        var link=document.createElement('link');
        link.rel='stylesheet';link.href=url;
        document.head.appendChild(link);
        var familyName=prompt('输入这个字体的 font-family 名称：\n（例如：Noto Serif SC）');
        if(!familyName||!familyName.trim()){App.showToast('已取消');return;}
        familyName=familyName.trim();
        var fontName='CSS_'+familyName.replace(/\s+/g,'_')+'_'+Date.now();
        var family="'"+familyName+"',serif";
        Font.customList.push({name:fontName,family:family,fileName:familyName,scale:1,cssUrl:url});
        Font.save();
        _previewingName = fontName;
        Font.render(panel);
        App.showToast('已添加：'+familyName);
        return;
      }

      var nameMatch=url.match(/([^\/]+)\.(ttf|otf|woff2?)$/i);
      var rawName=nameMatch?nameMatch[1]:'URLFont';
      var fontName='Custom_'+rawName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_')+'_'+Date.now();
      App.showToast('加载中...');
      var ff=new FontFace(fontName,'url('+url+')',{weight:'100 900'});
      ff.load().then(function(loaded){
        document.fonts.add(loaded);
        var family="'"+fontName+"',sans-serif";
        Font.customList.push({name:fontName,family:family,fileName:rawName,scale:1,url:url});
        Font.save();
        _previewingName = fontName;
        Font.render(panel);
        App.showToast('已添加：'+rawName);
      }).catch(function(){
        App.showToast('加载失败，请检查URL');
      });
    });

    panel.querySelector('#ftFileInput').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var rawName=file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_');
      var fontName='Custom_'+rawName+'_'+Date.now();
      App.showToast('加载字体中...');
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target.result;
        loadFontFace(fontName,dataUrl).then(function(ok){
          if(!ok){App.showToast('字体加载失败');return;}
          saveFont(fontName,dataUrl,function(success){
            if(!success){App.showToast('保存失败');return;}
            var family="'"+fontName+"',sans-serif";
            Font.customList.push({name:fontName,family:family,fileName:file.name,scale:1});
            Font.save();
            _previewingName = fontName;
            Font.render(panel);
            App.showToast('已添加：'+file.name);
          });
        });
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });

    /* 点击字体列表 → 只更新预览，不改全局 */
    panel.querySelectorAll('.ft-item').forEach(function(item){
      item.addEventListener('click',function(){
        _previewingName = item.dataset.fname;
        Font._updatePreviewArea(panel, _previewingName);
        panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
          el.classList.toggle('active', el.dataset.fname === _previewingName);
        });
      });
    });

    panel.querySelectorAll('.ft-custom-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.ft-del-btn'))return;
        _previewingName = card.dataset.fname;
        Font._updatePreviewArea(panel, _previewingName);
        panel.querySelectorAll('.ft-item,.ft-custom-card').forEach(function(el){
          el.classList.toggle('active', el.dataset.fname === _previewingName);
        });
      });
    });

    panel.querySelectorAll('.ft-del-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var name=btn.dataset.del;if(!name)return;
        if(!confirm('删除这个字体？'))return;
        deleteFont(name,function(){
          Font.customList=Font.customList.filter(function(f){return f.name!==name;});
          if(Font.config.selected===name){Font.config.selected='系统默认';Font.apply();}
          if(_previewingName===name) _previewingName=Font.config.selected;
          Font.save();Font.render(panel);
          App.showToast('已删除');
        });
      });
    });
  },

  init:function(){
    openDB(function(){
      Font.load();
      var selected = Font.config.selected || '系统默认';
      var isBuiltin = false;
      for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===selected){isBuiltin=true;break;}}
      if(isBuiltin){Font.apply();return;}
      var target = null;
      for(var j=0;j<Font.customList.length;j++){
        if(Font.customList[j].name===selected){target=Font.customList[j];break;}
      }
      if(!target){Font.apply();return;}
      if(target.cssUrl){
        var link=document.createElement('link');link.rel='stylesheet';link.href=target.cssUrl;document.head.appendChild(link);
        Font.apply();return;
      }
      if(target.url){
        var ff=new FontFace(target.name,'url('+target.url+')',{weight:'100 900'});
        ff.load().then(function(loaded){document.fonts.add(loaded);Font.apply();}).catch(function(){Font.apply();});
        return;
      }
      getOneFont(target.name, function(result){
        if(result&&result.dataUrl){
          loadFontFace(result.name,result.dataUrl).then(function(){Font.apply();}).catch(function(){Font.apply();});
        } else {Font.apply();}
      });
    });
    App.font=Font;
  }
};

App.register('font',Font);
})();
