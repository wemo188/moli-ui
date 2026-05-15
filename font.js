
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

var _db=null;

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

function getAllFonts(cb){
  if(!_db){cb([]);return;}
  var tx=_db.transaction(STORE_NAME,'readonly');
  var req=tx.objectStore(STORE_NAME).getAll();
  req.onsuccess=function(){cb(req.result||[]);};
  req.onerror=function(){cb([]);};
}

/* ★ 修复字重问题：增加 { weight: '100 900' } 声明，让浏览器支持全范围字重 */
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
    var panel=App.$('#fontPanel');if(!panel)return;
    getAllFonts(function(fonts){
      var promises=[];
      fonts.forEach(function(f){promises.push(loadFontFace(f.name,f.dataUrl));});
      Promise.all(promises).then(function(){
        Font.render(panel);
        panel.classList.remove('hidden');
        requestAnimationFrame(function(){panel.classList.add('show');});
      });
    });
  },

  close:function(){
    var panel=App.$('#fontPanel');if(!panel)return;
    panel.classList.remove('show');
    setTimeout(function(){panel.classList.add('hidden');},350);
  },

  render:function(panel){
    var selected=Font.config.selected||'系统默认';

    var builtinHtml=BUILTIN.map(function(f){
      var isActive=selected===f.name;
      return '<div class="ft-item'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">' +
        '<div class="ft-item-preview" style="font-family:'+f.family+';">你好世界 Hello</div>' +
        '<div class="ft-item-name">'+App.esc(f.name)+'</div>' +
        '<div class="ft-item-check"></div>' +
      '</div>';
    }).join('');

    var customHtml='';
    if(Font.customList.length){
      customHtml=Font.customList.map(function(f,ci){
        var isActive=selected===f.name;
        return '<div class="ft-custom-card'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'">' +
          '<div class="ft-custom-top">' +
          '<div class="ft-item-preview" style="font-family:'+f.family+';">你好世界 Hello</div>' +
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
      '<div class="hp-handle"></div>' +
      '<div class="hp-header">' +
        '<button class="hp-close" id="ftCloseBtn" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '</div>' +

      '<div class="hp-body">' +
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
        '<div class="hp-bottom-spacer"></div>' +
      '</div>';

    /* ★ 魔法印章：给刚生成的字体面板加上控制按钮 */
    if(App.initHalfPanelControls) App.initHalfPanelControls();

    Font.bindEvents(panel);
  },

  bindEvents:function(panel){
    panel.querySelector('#ftCloseBtn').addEventListener('click',function(){Font.close();});

    panel.querySelector('#ftUploadArea').addEventListener('click',function(){panel.querySelector('#ftFileInput').click();});
        panel.querySelector('#ftUrlArea').addEventListener('click',function(){
      var url=prompt('输入字体文件URL（.ttf/.otf/.woff/.woff2）：');
      if(!url||!url.trim())return;
      url=url.trim();
      var nameMatch=url.match(/([^\/]+)\.(ttf|otf|woff2?)$/i);
      var rawName=nameMatch?nameMatch[1]:'URLFont';
      var fontName='Custom_'+rawName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,'_')+'_'+Date.now();
      App.showToast('加载中...');
      var ff=new FontFace(fontName,'url('+url+')',{weight:'100 900'});
      ff.load().then(function(loaded){
        document.fonts.add(loaded);
        var family="'"+fontName+"',sans-serif";
        Font.customList.push({name:fontName,family:family,fileName:rawName,scale:1,url:url});
        Font.config.selected=fontName;
        Font.save();Font.apply();Font.render(panel);
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
            Font.config.selected=fontName;
            Font.save();Font.apply();Font.render(panel);
            App.showToast('已添加：'+file.name);
          });
        });
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });

    panel.querySelectorAll('.ft-item').forEach(function(item){
      item.addEventListener('click',function(){
        Font.config.selected=item.dataset.fname;
        Font.save();Font.apply();Font.render(panel);
      });
    });

    panel.querySelectorAll('.ft-custom-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.ft-del-btn'))return;
        if(e.target.closest('.ft-scale-slider'))return;
        Font.config.selected=card.dataset.fname;
        Font.save();Font.apply();Font.render(panel);
      });
    });

    panel.querySelectorAll('.ft-del-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var name=btn.dataset.del;if(!name)return;
        if(!confirm('删除这个字体？'))return;
        deleteFont(name,function(){
          Font.customList=Font.customList.filter(function(f){return f.name!==name;});
          if(Font.config.selected===name)Font.config.selected='系统默认';
          Font.save();Font.apply();Font.render(panel);
          App.showToast('已删除');
        });
      });
    });
  },

  init:function(){
    openDB(function(){
      Font.load();
      getAllFonts(function(fonts){
        fonts.forEach(function(f){loadFontFace(f.name,f.dataUrl);});
        Font.apply();
      });
    });
    App.font=Font;
  }
};

App.register('font',Font);
})();
