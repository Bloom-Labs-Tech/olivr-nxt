import { Builder, Element, JSX, loadImage } from 'canvacord';

type Props = {
  displayName: string;
  type: 'welcome' | 'goodbye';
  avatar: string;
  message: string;
};

type ElementOrString = Element | string;

declare function createElement(
  type: string | Element,
  props: Record<string, unknown>,
  ...children: (ElementOrString | ElementOrString[])[]
): Element;

export class GreetingsCard extends Builder<Props> {
  constructor() {
    super(930, 280);
    this.bootstrap({
      displayName: '',
      type: 'welcome',
      avatar: '',
      message: '',
    });
  }

  setDisplayName(value: string) {
    this.options.set('displayName', value);
    return this;
  }

  setType(value: 'welcome' | 'goodbye') {
    this.options.set('type', value);
    return this;
  }

  setAvatar(value: string) {
    this.options.set('avatar', value);
    return this;
  }

  setMessage(value: string) {
    this.options.set('message', value);
    return this;
  }

  async render() {
    const { type, displayName, avatar, message } = this.options.getOptions();

    const image = await loadImage(avatar);

    return JSX.createElement(
      'div',
      {
        className: 'h-full w-full flex flex-col items-center justify-center bg-[#23272A] rounded-xl',
      },
      JSX.createElement(
        'div',
        {
          className: 'px-6 bg-[#2B2F35AA] w-[96%] h-[84%] rounded-lg flex items-center',
        },
        JSX.createElement('img', {
          src: image.toDataURL(),
          className: 'flex h-[40] w-[40] rounded-full',
        }),
        JSX.createElement(
          'div',
          { className: 'flex flex-col ml-6' },
          JSX.createElement(
            'h1',
            { className: 'text-5xl text-white font-bold m-0' },
            type === 'welcome' ? 'Welcome' : 'Goodbye',
            ',',
            ' ',
            JSX.createElement('span', { className: 'text-blue-500' }, displayName, '!'),
          ),
          JSX.createElement('p', { className: 'text-gray-300 text-3xl m-0' }, message),
        ),
      ),
    );
  }
}