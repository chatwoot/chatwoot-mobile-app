import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { tailwind } from '@/theme';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  sheetRef?: React.RefObject<BottomSheetModal>;
}

// Função para validar HEX
const isValidHex = (hex: string): boolean => {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
};

// Paleta de cores pré-definidas
const COLOR_PALETTE = [
  // Vermelhos
  '#FF0000',
  '#FF4444',
  '#FF6B6B',
  '#FF9999',
  '#FFCCCC',
  // Laranjas
  '#FF8800',
  '#FFAA44',
  '#FFBB66',
  '#FFCC99',
  '#FFEECC',
  // Amarelos
  '#FFDD00',
  '#FFEE44',
  '#FFFF66',
  '#FFFF99',
  '#FFFFCC',
  // Verdes
  '#00FF00',
  '#44FF44',
  '#66FF66',
  '#99FF99',
  '#CCFFCC',
  // Azuis claros
  '#00AAFF',
  '#44BBFF',
  '#66CCFF',
  '#99DDFF',
  '#CCEEFF',
  // Azuis escuros
  '#0000FF',
  '#4444FF',
  '#6666FF',
  '#9999FF',
  '#CCCCFF',
  // Roxos
  '#AA00FF',
  '#BB44FF',
  '#CC66FF',
  '#DD99FF',
  '#EECCFF',
  // Rosa
  '#FF00AA',
  '#FF44BB',
  '#FF66CC',
  '#FF99DD',
  '#FFCCEE',
  // Cores neutras
  '#000000',
  '#333333',
  '#666666',
  '#999999',
  '#CCCCCC',
  '#FFFFFF',
  // Tons de marrom
  '#8B4513',
  '#A0522D',
  '#CD853F',
  '#DEB887',
  '#F5DEB3',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onColorChange,
  sheetRef: externalRef,
}) => {
  const internalRef = useRef<BottomSheetModal>(null);
  const sheetRef = externalRef || internalRef;

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const [hexValue, setHexValue] = useState(color || '#FF6B6B');

  const snapPoints = useMemo(() => ['75%'], []);

  // Atualizar hexValue quando color prop muda
  useEffect(() => {
    if (color && isValidHex(color)) {
      const normalizedColor = color.startsWith('#') ? color : `#${color}`;
      setHexValue(normalizedColor);
    }
  }, [color]);

  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setString(text);
  }, []);

  const handleHexChange = useCallback(
    (text: string) => {
      // Remover # se existir
      const cleanedText = text.replace('#', '');

      // Permitir apenas caracteres hexadecimais
      if (/^[0-9A-Fa-f]*$/.test(cleanedText) && cleanedText.length <= 6) {
        const newHex = cleanedText.length === 6 ? `#${cleanedText}` : cleanedText;
        setHexValue(newHex);

        // Se for um HEX válido, atualizar a cor
        if (cleanedText.length === 6 && isValidHex(newHex)) {
          onColorChange(newHex);
        }
      }
    },
    [onColorChange],
  );

  const handleColorSelect = useCallback(
    (selectedColor: string) => {
      setHexValue(selectedColor);
      onColorChange(selectedColor);
    },
    [onColorChange],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-[26px] overflow-hidden')}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      snapPoints={snapPoints}>
      <BottomSheetWrapper>
        <BottomSheetScrollView contentContainerStyle={tailwind.style('px-4 pb-6')}>
          {/* Header */}
          <View style={tailwind.style('flex-row items-center justify-between mb-6')}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
              Seletor de cores
            </Text>
            <Pressable onPress={() => sheetRef.current?.dismiss()}>
              <Text style={tailwind.style('text-gray-600 text-lg')}>✕</Text>
            </Pressable>
          </View>

          {/* Preview da cor selecionada */}
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Cor selecionada</Text>
            <View
              style={[
                tailwind.style('w-full h-32 rounded-xl border-2 border-gray-300'),
                { backgroundColor: isValidHex(hexValue) ? hexValue : '#FF6B6B' },
              ]}
            />
          </View>

          {/* Input HEX */}
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Código HEX</Text>
            <View style={tailwind.style('flex-row items-center gap-2')}>
              <TextInput
                style={tailwind.style(
                  'flex-1 text-base font-inter-normal-20 py-3 px-4 rounded-xl text-gray-950 bg-white border-2 border-gray-300',
                )}
                value={hexValue.replace('#', '')}
                onChangeText={handleHexChange}
                placeholder="FF6B6B"
                placeholderTextColor={tailwind.color('text-gray-500')}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
              />
              <View
                style={[
                  tailwind.style('w-12 h-12 rounded-lg border-2 border-gray-300'),
                  { backgroundColor: isValidHex(hexValue) ? hexValue : '#FF6B6B' },
                ]}
              />
              <Pressable
                onPress={() => copyToClipboard(hexValue)}
                style={tailwind.style(
                  'w-12 h-12 items-center justify-center bg-gray-100 rounded-lg',
                )}>
                <Text style={tailwind.style('text-gray-600 text-lg')}>📋</Text>
              </Pressable>
            </View>
          </View>

          {/* Paleta de cores */}
          <View style={tailwind.style('mb-4')}>
            <Text style={tailwind.style('text-sm text-gray-600 mb-3')}>Paleta de cores</Text>
            <View style={tailwind.style('flex-row flex-wrap gap-3 justify-between')}>
              {COLOR_PALETTE.map((colorItem, index) => (
                <Pressable
                  key={`${colorItem}-${index}`}
                  onPress={() => handleColorSelect(colorItem)}
                  style={tailwind.style('mb-2')}>
                  <View
                    style={[
                      tailwind.style('w-14 h-14 rounded-lg border-2'),
                      {
                        backgroundColor: colorItem,
                        borderColor:
                          hexValue.toLowerCase() === colorItem.toLowerCase()
                            ? '#000000'
                            : '#E5E7EB',
                        borderWidth: hexValue.toLowerCase() === colorItem.toLowerCase() ? 3 : 2,
                      },
                    ]}>
                    {/* Indicador de seleção */}
                    {hexValue.toLowerCase() === colorItem.toLowerCase() && (
                      <View style={tailwind.style('absolute inset-0 items-center justify-center')}>
                        <Text style={tailwind.style('text-white text-xl font-bold')}>✓</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
