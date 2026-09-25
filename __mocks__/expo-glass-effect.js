const React = require('react');
const { View } = require('react-native');

const GlassView = ({ children, ...props }) => React.createElement(View, props, children);
const GlassContainer = GlassView;
const isLiquidGlassAvailable = () => false;
const isGlassEffectAPIAvailable = () => false;

module.exports = { GlassView, GlassContainer, isLiquidGlassAvailable, isGlassEffectAPIAvailable };
