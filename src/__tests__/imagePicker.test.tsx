import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImagePicker } from '@/components/publish/ImagePicker';

const fireFiles = async (files: { size: number }[]) => {
  const input = screen.getByTestId('image-input') as HTMLInputElement;
  await act(async () => {
    fireEvent.change(input, { target: { files: files as unknown as FileList } });
  });
};

describe('ImagePicker 图片选择器', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('渲染添加 tile 与隐藏 file input', () => {
    render(<ImagePicker images={[]} onChange={() => {}} onToast={() => {}} />);
    expect(screen.getByRole('button', { name: '添加图片' })).toBeInTheDocument();
    expect(screen.getByTestId('image-input')).toBeInTheDocument();
  });

  it('选图成功：FileReader 转 dataURL 后追加', async () => {
    const onChange = vi.fn();
    class MockFileReader {
      result: string | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        this.result = 'data:image/png;base64,AAAA';
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    render(<ImagePicker images={[]} onChange={onChange} onToast={() => {}} />);
    await fireFiles([{ size: 100 }]);
    expect(onChange).toHaveBeenCalledWith(['data:image/png;base64,AAAA']);
  });

  it('单图超过 800KB → 拦截并 toast，不加入新图', async () => {
    const onChange = vi.fn();
    const onToast = vi.fn();
    render(<ImagePicker images={[]} onChange={onChange} onToast={onToast} />);
    await fireFiles([{ size: 800 * 1024 + 1 }]);
    expect(onToast).toHaveBeenCalledWith('单张图片不能超过 800KB');
    expect(onChange).toHaveBeenCalledWith([]); // 原数组未变（空）
  });

  it('图片总量超 4MB → 拦截并 toast', async () => {
    const onChange = vi.fn();
    const onToast = vi.fn();
    // 预置一张接近上限的 dataURL（base64 长度折算约 4.2MB），再加一张小图触发总量拦截
    const bigDataUrl = 'data:image/png;base64,' + 'A'.repeat(5_600_000);
    render(<ImagePicker images={[bigDataUrl]} onChange={onChange} onToast={onToast} />);
    await fireFiles([{ size: 100 }]);
    expect(onToast).toHaveBeenCalledWith('图片总量不能超过 4MB');
    expect(onChange).toHaveBeenCalledWith([bigDataUrl]); // 原数组未变
  });

  it('达到 9 张后再选 → 提示最多上传 9 张且不追加', async () => {
    const onChange = vi.fn();
    const onToast = vi.fn();
    const nine = Array.from({ length: 9 }, (_, i) => `data:image/png;base64,${i}`);
    render(<ImagePicker images={nine} onChange={onChange} onToast={onToast} />);
    await fireFiles([{ size: 100 }]);
    expect(onToast).toHaveBeenCalledWith('最多上传 9 张图片');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('删除缩略图 → onChange 返回剩余图片', () => {
    const onChange = vi.fn();
    render(
      <ImagePicker
        images={['data:image/png;base64,A', 'data:image/png;base64,B']}
        onChange={onChange}
        onToast={() => {}}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: '删除图片' })[0]);
    expect(onChange).toHaveBeenCalledWith(['data:image/png;base64,B']);
  });
});
