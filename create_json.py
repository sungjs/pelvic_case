import os
import json
import re

# 이미지가 있는 최상위 폴더 경로
base_folder_path = '.'

def find_folder_pairs(path):
    """지정된 경로에서 'XXXauto'와 'XXXmanual' 형태의 폴더 쌍을 찾습니다."""
    folders = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
    pairs = {}
    
    for folder in folders:
        if folder.endswith('auto'):
            manual_equivalent = folder.replace('auto', 'manual')
            if manual_equivalent in folders:
                prefix_match = re.match(r'(\d+)', folder)
                if prefix_match:
                    prefix = prefix_match.group(1)
                    pairs[prefix] = {
                        'auto_folder': folder,
                        'manual_folder': manual_equivalent
                    }
    return pairs

def get_sorted_images(folder_path):
    """폴더 내의 이미지 파일 목록을 정렬하여 반환합니다."""
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('png', 'jpg', 'jpeg'))]
    return sorted(files)

# 최종 데이터를 담을 딕셔너리
data = {"cases": []}
folder_pairs = find_folder_pairs(base_folder_path)
sorted_prefixes = sorted(folder_pairs.keys())

print("이미지 목록 생성을 시작합니다...")
for prefix in sorted_prefixes:
    pair_info = folder_pairs[prefix]
    auto_folder = pair_info['auto_folder']
    manual_folder = pair_info['manual_folder']
    
    auto_images = [f"{auto_folder}/{img}" for img in get_sorted_images(auto_folder)]
    manual_images = [f"{manual_folder}/{img}" for img in get_sorted_images(manual_folder)]
    
    if auto_images and manual_images:
        data["cases"].append({
            "name": f"Case {prefix}",
            "prefix": prefix,
            "auto_images": auto_images,
            "manual_images": manual_images
        })
        print(f"- Case {prefix} 처리 완료")

# images.json 파일로 저장
with open('images.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("\n'images.json' 파일 생성이 완료되었습니다!")