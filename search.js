
(function() {
    'use strict';

    function loadSavedAvatar(side, previewId) {
        var saved = localStorage.getItem('avatar_' + side);
        var preview = document.getElementById(previewId);
        if (saved && preview) {
            preview.innerHTML = '';
            var img = document.createElement('img');
            img.src = saved;
            preview.appendChild(img);
        }
    }

    function saveAvatar(side, dataUrl, previewId) {
        localStorage.setItem('avatar_' + side, dataUrl);
        var preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '';
            var img = document.createElement('img');
            img.src = dataUrl;
            preview.appendChild(img);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // 加载已保存的头像
        loadSavedAvatar('left', 'avatarPreviewLeft');
        loadSavedAvatar('right', 'avatarPreviewRight');

        // 左边上传
        var leftArea = document.querySelector('.avatar-area-left');
        var leftInput = document.getElementById('avatarInputLeft');
        if (leftArea && leftInput) {
            leftArea.addEventListener('click', function() {
                leftInput.click();
            });
            leftInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        saveAvatar('left', ev.target.result, 'avatarPreviewLeft');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // 右边上传
        var rightArea = document.querySelector('.avatar-area-right');
        var rightInput = document.getElementById('avatarInputRight');
        if (rightArea && rightInput) {
            rightArea.addEventListener('click', function() {
                rightInput.click();
            });
            rightInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        saveAvatar('right', ev.target.result, 'avatarPreviewRight');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
})();