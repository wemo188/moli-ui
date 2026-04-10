// search.js
(function() {
    'use strict';

    // 等待 DOM 加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 左边头像上传
        const leftArea = document.querySelector('.avatar-area-left');
        const leftInput = document.getElementById('avatarInputLeft');
        const leftPreview = document.getElementById('avatarPreviewLeft');
        
        if (leftArea && leftInput && leftPreview) {
            leftArea.addEventListener('click', function() {
                leftInput.click();
            });
            
            leftInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        leftPreview.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        leftPreview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // 右边头像上传
        const rightArea = document.querySelector('.avatar-area-right');
        const rightInput = document.getElementById('avatarInputRight');
        const rightPreview = document.getElementById('avatarPreviewRight');
        
        if (rightArea && rightInput && rightPreview) {
            rightArea.addEventListener('click', function() {
                rightInput.click();
            });
            
            rightInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        rightPreview.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        rightPreview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
})();
