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

var DEF_CFG={selected:'系统默认',fontSize:15,fontWeight:400,lineHeight:1.6};

/* ====== IndexedDB for font files ====== */
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

function loadFontFace(name,dataUrl){
  var ff=new FontFace(name,'url('+dataUrl+')');
  return ff.load().then(function(loaded){document.fonts.add(loaded);return true;}).catch(function(){return false;});
}

/* ====== Font Module ====== */
var Font={
  config:{},
  customList:[], // [{name,family}]

  load:function(){
    Font.config=App.LS.get('fontConfig')||JSON.parse(JSON.stringify(DEF_CFG));
    Font.customList=App.LS.get('fontCustomList')||[];
  },

  save:function(){
    App.LS.set('fontConfig',Font.config);
    App.LS.set('fontCustomList',Font.customList);
  },

  apply:function(){
    var c=Font.config;
    var selected=c.selected||'系统默认';
    var family='';

    // 查找内置
    for(var i=0;i<BUILTIN.length;i++){
      if(BUILTIN[i].name===selected){family=BUILTIN[i].family;break;}
    }
    // 查找自定义
    if(!family){
      for(var j=0;j<Font.customList.length;j++){
        if(Font.customList[j].name===selected){family=Font.customList[j].family;break;}
      }
    }
    if(!family)family=BUILTIN[0].family;

    document.body.style.fontFamily=family;
    document.body.style.fontSize=(c.fontSize||15)+'px';
    document.body.style.fontWeight=c.fontWeight||400;
    document.body.style.lineHeight=c.lineHeight||1.6;
  },

  open:function(){
    Font.load();
    var panel=App.$('#fontPanel');if(!panel)return;

    // 先加载所有自定义字体到浏览器
    getAllFonts(function(fonts){
      var loadPromises=[];
      fonts.forEach(function(f){
        loadPromises.push(loadFontFace(f.name,f.dataUrl));
      });
      Promise.all(loadPromises).then(function(){
        Font.render(panel);
        panel.classList.remove('hidden');
        setTimeout(function(){panel.classList.add('show');},20);
      });
    });
  },

  close:function(){
    var panel=App.$('#fontPanel');if(!panel)return;
    panel.classList.remove('show');
    setTimeout(function(){panel.classList.add('hidden');},350);
  },

  render:function(panel){
    var c=Font.config;
    var selected=c.selected||'系统默认';

    // 内置字体列表
    var builtinHtml=BUILTIN.map(function(f){
      var isActive=selected===f.name;
      return '<div class="ft-item'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'" data-family="'+App.escAttr(f.family)+'">' +
        '<div class="ft-item-preview" style="font-family:'+f.family+';">你好世界 Hello</div>' +
        '<div class="ft-item-info"><div class="ft-item-name">'+App.esc(f.name)+'</div></div>' +
        '<div class="ft-item-check"></div>' +
      '</div>';
    }).join('');

    // 自定义字体列表
    var customHtml='';
    if(Font.customList.length){
      customHtml=Font.customList.map(function(f){
        var isActive=selected===f.name;
        return '<div class="ft-item'+(isActive?' active':'')+'" data-fname="'+App.escAttr(f.name)+'" data-family="'+App.escAttr(f.family)+'" data-custom="1">' +
          '<div class="ft-item-preview" style="font-family:'+f.family+';">你好世界 Hello</div>' +
          '<div class="ft-item-info"><div class="ft-item-name">'+App.esc(f.name)+'</div></div>' +
          '<div class="ft-item-actions"><div class="ft-del-btn" data-del="'+App.escAttr(f.name)+'"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div></div>' +
          '<div class="ft-item-check"></div>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;background:#fff;border-bottom:1px solid rgba(126,163,201,.2);flex-shrink:0;z-index:10;">' +
        '<button id="ftCloseBtn" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>' +
        '<span style="font-size:16px;font-weight:800;color:#2e4258;letter-spacing:1px;">字体设置</span>' +
        '<div style="width:36px;"></div>' +
      '</div>' +
      '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;">' +

        /* 预览区 */
        '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
          '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#7a9ab8;border-radius:2px;"></div>预览</div>' +
          '<div id="ftPreview" style="padding:16px;background:rgba(126,163,201,.04);border:1px solid rgba(126,163,201,.12);border-radius:12px;min-height:60px;transition:all .2s;">'+
            '<div style="margin-bottom:6px;">你好世界，这是一段预览文字。</div>'+
            '<div style="font-size:0.85em;color:#8aa0b8;">Hello World, The quick brown fox jumps over the lazy dog.</div>'+
          '</div>' +
        '</div>' +

        /* 样式控制 */
        '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
          '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#88abda;border-radius:2px;"></div>样式调整 (实时预览)</div>' +

          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
            '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">字号</span>' +
            '<input type="range" id="ftSize" min="12" max="22" step="0.5" value="'+(c.fontSize||15)+'" style="flex:1;">' +
            '<span id="ftSizeVal" style="font-size:12px;font-weight:700;color:#2e4258;width:36px;text-align:right;">'+(c.fontSize||15)+'px</span>' +
          '</div>' +

          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
            '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">粗细</span>' +
            '<input type="range" id="ftWeight" min="100" max="900" step="100" value="'+(c.fontWeight||400)+'" style="flex:1;">' +
            '<span id="ftWeightVal" style="font-size:12px;font-weight:700;color:#2e4258;width:36px;text-align:right;">'+(c.fontWeight||400)+'</span>' +
          '</div>' +

          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">行距</span>' +
            '<input type="range" id="ftLineH" min="1" max="2.5" step="0.05" value="'+(c.lineHeight||1.6)+'" style="flex:1;">' +
            '<span id="ftLineHVal" style="font-size:12px;font-weight:700;color:#2e4258;width:36px;text-align:right;">'+(c.lineHeight||1.6)+'</span>' +
          '</div>' +
        '</div>' +

        /* 内置字体 */
        '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
          '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#5a9e6f;border-radius:2px;"></div>内置字体</div>' +
          '<div class="ft-list" id="ftBuiltinList">'+builtinHtml+'</div>' +
        '</div>' +

        /* 自定义字体 */
        '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:30px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
          '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#c9706b;border-radius:2px;"></div>自定义字体</div>' +

          '<div id="ftUploadArea" style="width:100%;height:54px;border:2px dashed rgba(126,163,201,.4);border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;color:#7a9ab8;cursor:pointer;background:rgba(126,163,201,.05);margin-bottom:16px;-webkit-tap-highlight-color:transparent;">' +
            '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '上传字体文件 (.ttf .otf .woff .woff2)' +
          '</div>' +
          '<input type="file" id="ftFileInput" accept=".ttf,.otf,.woff,.woff2" hidden>' +

          '<div class="ft-list" id="ftCustomList">'+(customHtml||'<div style="text-align:center;color:#bbb;font-size:12px;padding:16px 0;">暂无自定义字体</div>')+'</div>' +
        '</div>' +

      '</div>';

    Font.bindEvents(panel);
    Font.updatePreview(panel);
  },

  updatePreview:function(panel){
    var preview=panel.querySelector('#ftPreview');if(!preview)return;
    var c=Font.config;
    var selected=c.selected||'系统默认';
    var family='';

    for(var i=0;i<BUILTIN.length;i++){if(BUILTIN[i].name===selected){family=BUILTIN[i].family;break;}}
    if(!family){for(var j=0;j<Font.customList.length;j++){if(Font.customList[j].name===selected){family=Font.customList[j].family;break;}}}
    if(!family)family=BUILTIN[0].family;

    preview.style.fontFamily=family;
    preview.style.fontSize=(c.fontSize||15)+'px';
    preview.style.fontWeight=c.fontWeight||400;
    preview.style.lineHeight=c.lineHeight||1.6;
  },

  bindEvents:function(panel){
    // 关闭
    panel.querySelector('#ftCloseBtn').addEventListener('click',function(){Font.close();});

    // 右滑返回
    App.bindSwipeBack(panel,function(){Font.close();});

    // 上传
    panel.querySelector('#ftUploadArea').addEventListener('click',function(){panel.querySelector('#ftFileInput').click();});
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
            Font.customList.push({name:fontName,family:family,fileName:file.name});
            Font.config.selected=fontName;
            Font.save();
            Font.apply();
            Font.render(panel);
            App.showToast('字体已添加：'+file.name);
          });
        });
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });

    // 滑块
    var sizeSlider=panel.querySelector('#ftSize');
    var weightSlider=panel.querySelector('#ftWeight');
    var lineHSlider=panel.querySelector('#ftLineH');

    function onSlider(){
      Font.config.fontSize=parseFloat(sizeSlider.value);
      Font.config.fontWeight=parseInt(weightSlider.value);
      Font.config.lineHeight=parseFloat(lineHSlider.value);
      panel.querySelector('#ftSizeVal').textContent=sizeSlider.value+'px';
      panel.querySelector('#ftWeightVal').textContent=weightSlider.value;
      panel.querySelector('#ftLineHVal').textContent=lineHSlider.value;
      Font.save();
      Font.apply();
      Font.updatePreview(panel);
    }

    sizeSlider.addEventListener('input',onSlider);
    weightSlider.addEventListener('input',onSlider);
    lineHSlider.addEventListener('input',onSlider);

    // 选择字体
    panel.querySelectorAll('.ft-item').forEach(function(item){
      item.addEventListener('click',function(e){
        if(e.target.closest('.ft-del-btn'))return;
        Font.config.selected=item.dataset.fname;
        Font.save();
        Font.apply();
        Font.render(panel);
      });
    });

    // 删除自定义字体
    panel.querySelectorAll('.ft-del-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var name=btn.dataset.del;if(!name)return;
        if(!confirm('删除字体 "'+name+'" ？'))return;
        deleteFont(name,function(){
          Font.customList=Font.customList.filter(function(f){return f.name!==name;});
          if(Font.config.selected===name)Font.config.selected='系统默认';
          Font.save();
          Font.apply();
          Font.render(panel);
          App.showToast('已删除');
        });
      });
    });
  },

  init:function(){
    openDB(function(){
      Font.load();

      // 恢复自定义字体到浏览器
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