// 应聘者切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有应聘者项
    const candidateItems = document.querySelectorAll('.candidate-item');
    // 获取所有能力部分
    const abilitySections = document.querySelectorAll('.ability-section');
    // 获取上传区域
    const uploadArea = document.querySelector('.upload-area');
    // 获取文件输入
    const resumeUpload = document.getElementById('resume-upload');
    // 获取上传状态
    const uploadStatus = document.querySelector('.upload-status');
    // 获取上传按钮
    const uploadBtn = document.querySelector('.upload-btn');
    // 获取预览内容区域
    const previewContent = document.querySelector('.preview-content');
    // 获取上传区域
    const uploadSection = document.getElementById('upload-section');
    
    // 当前选中的应聘者
    let currentCandidate = 'zhuzhixuan';
    
    // 应聘者切换事件
    candidateItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有活跃状态
            candidateItems.forEach(i => i.classList.remove('active'));
            abilitySections.forEach(section => section.classList.remove('active'));
            
            // 添加活跃状态到当前选中项
            this.classList.add('active');
            
            // 显示对应能力部分
            const candidateId = this.getAttribute('data-candidate');
            currentCandidate = candidateId;
            const correspondingSection = document.getElementById(`${candidateId}-abilities`);
            if (correspondingSection) {
                correspondingSection.classList.add('active');
            }
            
            // 恢复该应聘者的简历
            loadResume(candidateId);
        });
    });
    
    // 页面加载时恢复当前应聘者的简历
    loadResume(currentCandidate);
    
    // 上传区域点击事件
    uploadArea.addEventListener('click', function() {
        resumeUpload.click();
    });
    
    // 上传按钮点击事件
    uploadBtn.addEventListener('click', function() {
        resumeUpload.click();
    });
    
    // 文件选择事件
    resumeUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            uploadStatus.innerHTML = `<p>已上传：${file.name}</p>`;
            previewFile(file);
            saveResume(file);
            // 隐藏上传区域
            uploadSection.style.display = 'none';
        }
    });
    
    // 拖拽功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ffffff';
        this.style.background = 'rgba(78, 205, 196, 0.15)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = '#4ecdc4';
        this.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#4ecdc4';
        this.style.background = 'transparent';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            resumeUpload.files = e.dataTransfer.files;
            uploadStatus.innerHTML = `<p>已上传：${file.name}</p>`;
            previewFile(file);
            saveResume(file);
            // 隐藏上传区域
            uploadSection.style.display = 'none';
        }
    });
    
    // 保存简历到本地存储
    function saveResume(file) {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            // 保存可预览的文件
            const reader = new FileReader();
            reader.onload = function(e) {
                const resumeData = {
                    name: fileName,
                    type: file.type,
                    size: file.size,
                    content: e.target.result,
                    extension: fileExtension,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(`resume_${currentCandidate}`, JSON.stringify(resumeData));
            };
            reader.readAsDataURL(file);
        } else {
            // 保存其他文件类型（只保存文件信息）
            const resumeData = {
                name: fileName,
                type: file.type,
                size: file.size,
                extension: fileExtension,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(`resume_${currentCandidate}`, JSON.stringify(resumeData));
        }
    }
    
    // 从本地存储加载简历
    function loadResume(candidateId) {
        const resumeData = localStorage.getItem(`resume_${candidateId}`);
        if (resumeData) {
            const data = JSON.parse(resumeData);
            uploadStatus.innerHTML = `<p>已上传：${data.name}</p>`;
            
            // 隐藏上传区域
            uploadSection.style.display = 'none';
            
            if (data.content) {
                // 显示已保存的可预览文件
                if (data.extension === 'pdf') {
                    previewContent.innerHTML = `<iframe src="${data.content}"></iframe>`;
                } else if (['jpg', 'jpeg', 'png', 'gif'].includes(data.extension)) {
                    previewContent.innerHTML = `<img src="${data.content}" alt="简历预览">`;
                }
            } else {
                // 显示文件信息
                if (['doc', 'docx'].includes(data.extension)) {
                    previewContent.innerHTML = `
                        <div style="text-align: left;">
                            <h4>${data.name}</h4>
                            <p>文件类型：Word文档</p>
                            <p>文件大小：${(data.size / 1024).toFixed(2)} KB</p>
                            <p>提示：Word文档需要下载后查看</p>
                        </div>
                    `;
                } else {
                    previewContent.innerHTML = `
                        <div style="text-align: left;">
                            <h4>${data.name}</h4>
                            <p>文件类型：${data.type || '未知'}</p>
                            <p>文件大小：${(data.size / 1024).toFixed(2)} KB</p>
                            <p>提示：此文件类型不支持预览</p>
                        </div>
                    `;
                }
            }
        } else {
            // 无保存的简历
            uploadStatus.innerHTML = '<p>未上传简历</p>';
            resumeUpload.value = '';
            previewContent.innerHTML = '<p>请上传简历文件</p>';
            // 显示上传区域
            uploadSection.style.display = 'block';
        }
    }
    
    // 预览文件函数
    function previewFile(file) {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (fileExtension === 'pdf') {
            // 预览PDF文件
            const fileURL = URL.createObjectURL(file);
            previewContent.innerHTML = `<iframe src="${fileURL}"></iframe>`;
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            // 预览图片文件
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContent.innerHTML = `<img src="${e.target.result}" alt="简历预览">`;
            };
            reader.readAsDataURL(file);
        } else if (['doc', 'docx'].includes(fileExtension)) {
            // Word文档预览（显示文件信息）
            previewContent.innerHTML = `
                <div style="text-align: left;">
                    <h4>${fileName}</h4>
                    <p>文件类型：Word文档</p>
                    <p>文件大小：${(file.size / 1024).toFixed(2)} KB</p>
                    <p>提示：Word文档需要下载后查看</p>
                </div>
            `;
        } else {
            // 其他文件类型
            previewContent.innerHTML = `
                <div style="text-align: left;">
                    <h4>${fileName}</h4>
                    <p>文件类型：${file.type || '未知'}</p>
                    <p>文件大小：${(file.size / 1024).toFixed(2)} KB</p>
                    <p>提示：此文件类型不支持预览</p>
                </div>
            `;
        }
    }
    
    // 生成二维码
    function generateQRCode() {
        const qrcodeElement = document.getElementById('qrcode');
        if (qrcodeElement) {
            qrcodeElement.innerHTML = '';
            new QRCode(qrcodeElement, {
                text: window.location.href,
                width: 100,
                height: 100,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    
    // 等待页面加载完成后生成二维码
    window.addEventListener('load', function() {
        setTimeout(generateQRCode, 100);
    });
});