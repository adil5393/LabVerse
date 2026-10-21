// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { PracticeDeck } from './PracticeDeck';
import type { Question } from '../../engine/education/types';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('keeps submitted feedback when returning to a question and shows only one question at a time', () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  const onAnswer = vi.fn();
  const question = (id: string): Question => ({ kind: 'numeric', id, prompt: `Find the speed ${id}`, answer: 4, explanation: '20 divided by 5 is 4', defaultFeedback: { message: 'Divide distance by time.' } });
  try {
    act(() => root.render(<PracticeDeck groups={[{ id: 'speed', title: 'Speed', blurb: '', items: [{ id: 'one', question: question('one') }, { id: 'two', question: question('two') }] }]} onAnswer={onAnswer} />));
    expect(host.querySelectorAll('[data-question]')).toHaveLength(1);
    const input = host.querySelector<HTMLInputElement>('input[inputmode="decimal"]')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '4'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    act(() => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(host.querySelector('[data-correct="true"]')).not.toBeNull();
    const button = (text: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.startsWith(text))!;
    act(() => button('Next question').click());
    expect(host.querySelector('[data-question="two"]')).not.toBeNull();
    act(() => button('Previous').click());
    expect(host.querySelector('[data-correct="true"]')).not.toBeNull();
    expect(host.querySelector<HTMLInputElement>('input')?.value).toBe('4');
    expect(onAnswer).toHaveBeenCalledTimes(1);
  } finally { act(() => root.unmount()); host.remove(); }
});
