import { useContext, useEffect, useState } from "react"
import { NaniwaEditorContext } from "../NaniwaEditorManager"
import Select from 'react-select';

export const PlayerInspector = () => {
    const [selectedOption, setSelectedOption] = useState<{value: string, label: string}>(null);
    const editor = useContext(NaniwaEditorContext);
    const [playerManager, setPlayerManager] = useState(editor.playerManager);

    useEffect(() => {
        const interval = setInterval(() => {
          myFrame();
        }, 1000 / 10);
        return () => clearInterval(interval);
      }, [playerManager])
    
      const myFrame = () => {
          if (editor.getPlayerManager().object != playerManager.object){
            setPlayerManager(editor.getPlayerManager());
        }
    }
    
    const options: {value: string, label: string}[] = [];
    playerManager.animations.map((anim, idx) => {
        options.push({
            value: idx.toString(),
            label: anim.name? anim.name: `未設定${idx+1}`
        });
    });

    const onHandleChange = (selected: {value: string, label: string}) => {
        setSelectedOption(selected);
        editor.setSelectPlayerAnimation(selected.label);
    }

    return (
        <>
            {playerManager.object &&
                <>
                    <div>
                        <div>
                            アニメーションの動作確認
                        </div>
                        <div>
                            <Select
                                options={options}
                                value={selectedOption}
                                onChange={onHandleChange}
                                styles={darkThemeStyles}
                            />
                        </div>
                    </div>
                    <div>
                        <div>
                            種別
                        </div>
                        <div>
                            <Select
                                options={options}
                                value={selectedOption}
                                onChange={onHandleChange}
                                styles={darkThemeStyles}
                            />
                        </div>
                    </div>
                    <div>
                        <div>
                            モーション割り当て
                        </div>
                        <div>
                            <div>
                                <div>静止時</div>
                                <div>
                                <Select
                                    options={options}
                                    value={selectedOption}
                                    onChange={onHandleChange}
                                    styles={darkThemeStyles}
                                />
                                </div>
                            </div>
                            <div>
                                <div>歩く</div>
                                <div>
                                <Select
                                    options={options}
                                    value={selectedOption}
                                    onChange={onHandleChange}
                                    styles={darkThemeStyles}
                                />
                                </div>
                            </div>
                            <div>
                                <div>走る</div>
                                <div>
                                <Select
                                    options={options}
                                    value={selectedOption}
                                    onChange={onHandleChange}
                                    styles={darkThemeStyles}
                                />
                                </div>
                            </div>
                            <div>
                                <div>ジャンプ</div>
                                <div>
                                <Select
                                    options={options}
                                    value={selectedOption}
                                    onChange={onHandleChange}
                                    styles={darkThemeStyles}
                                />
                                </div>
                            </div>
                            <div>
                                <div>アクション1</div>
                                <div>
                                <Select
                                    options={options}
                                    value={selectedOption}
                                    onChange={onHandleChange}
                                    styles={darkThemeStyles}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <a>
                            アバターを保存
                        </a>
                    </div>
                </>
            }
        </>
    )
}

/**
 * 選択肢のダークテーマスタイル
 */
const darkThemeStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#111',
      borderColor: '#444',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: '#333',
    }),
    option: (styles, { isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor:
          isSelected
            ? '#555'
            : isFocused
            ? '#444'
            : 'transparent',
        color: isSelected ? '#ddd' : '#fff',
      };
    },
  };