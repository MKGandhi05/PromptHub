import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import openaiLogo from '../assets/openai.png';
import azureLogo from '../assets/azure.png';

const MODELS = [
	{
		provider: 'openai',
		label: 'GPT-4o',
		description: 'Fast, intelligent, flexible GPT model',
		bg: 'linear-gradient(120deg, #6ee7b7 0%, #3b82f6 100%)',
		textColor: '#fff',
	},
	{
		provider: 'openai',
		label: 'o4 – mini',
		description: 'Faster, more affordable reasoning model',
		bg: 'linear-gradient(120deg, #fdf6e3 0%, #c9d6ff 100%)',
		textColor: '#222',
	},
	{
		provider: 'openai',
		label: 'GPT-4.1 -mini',	
		description: 'Balanced for intelligence, speed, and cost',
		bg: 'linear-gradient(120deg, #60a5fa 0%, #a7f3d0 100%)',
		textColor: '#fff',
	},
	{
		provider: 'azure',
		label: 'GPT-4o',
		description: 'Fast, intelligent, flexible GPT model',
		bg: 'linear-gradient(120deg, #6ee7b7 0%, #3b82f6 100%)',
		textColor: '#fff',
	},
	{
		provider: 'azure',
		label: 'o4 – mini',
		description: 'Faster, more affordable reasoning model',
		bg: 'linear-gradient(120deg, #fdf6e3 0%, #c9d6ff 100%)',
		textColor: '#222',
	},
];

export default function Playground() {
	const [selectedModels, setSelectedModels] = useState([]);
	const navigate = useNavigate();

	const handleSelectModel = (model) => {
		setSelectedModels((prev) => {
			const exists = prev.some(
				(m) => m.provider === model.provider && m.label === model.label
			);
			if (exists) {
				return prev.filter(
					(m) => !(m.provider === model.provider && m.label === model.label)
				);
			} else {
				if (prev.length >= 5) return prev; // Max 5 models
				return [...prev, model];
			}
		});
	};

	const handleCompare = () => {
		// Save selected models to localStorage for session page
		localStorage.setItem('selectedModels', JSON.stringify(selectedModels));
		navigate('/playground/session');
	};

	// ModelCard inlined
	const ModelCard = ({
		model,
		provider,
		selected,
		onSelect,
		interactive,
		description,
		bg,
		textColor,
	}) => {
		const logo = provider === 'openai' ? openaiLogo : azureLogo;
		return (
			<div
				onClick={() => interactive && onSelect()}
				style={{
					position: 'relative',
					border: selected ? '2px solid #2563eb' : '2px solid transparent',
					borderRadius: 16,
					margin: 8,
					background: '#18181b',
					cursor: 'pointer',
					minWidth: 320,
					maxWidth: 340,
					minHeight: 180,
					boxShadow: selected ? '0 6px 32px 0 #2563eb22' : '0 2px 12px 0 #0001',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'flex-start',
					transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
				}}
			>
				<img
					src={logo}
					alt={provider + ' logo'}
					style={{
						position: 'absolute',
						top: 12,
						left: 12,
						width: 28,
						height: 28,
						zIndex: 2,
						objectFit: 'contain',
					}}
				/>
				<div
					style={{
						width: '100%',
						height: 100,
						borderRadius: 12,
						background: bg,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 16,
					}}
				>
					<span
						style={{
							color: textColor,
							fontWeight: 800,
							fontSize: 32,
							letterSpacing: 1,
							textShadow: '0 2px 8px #0002',
						}}
					>
						{model.replace(' -mini', ' mini')}
					</span>
				</div>
				<div
					style={{
						color: '#cbd5e1',
						fontSize: 16,
						textAlign: 'center',
						marginBottom: 8,
						minHeight: 44,
					}}
				>
					{description}
				</div>
			</div>
		);
	};

	// ModelSelectGrid inlined
	const ModelSelectGrid = ({ selectedModels, onSelect }) => {
		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gridTemplateRows: 'repeat(2, 1fr)',
					gap: 32,
					marginBottom: 24,
					width: '100%',
					maxWidth: 1050,
					minHeight: 420,
					alignItems: 'center',
					justifyItems: 'center',
				}}
			>
				{MODELS.map((model, idx) => (
					<ModelCard
						key={`${model.provider}-${model.label}`}
						model={model.label}
						provider={model.provider}
						selected={selectedModels.some(
							(m) => m.provider === model.provider && m.label === model.label
						)}
						onSelect={() => onSelect(model)}
						interactive={true}
						description={model.description}
						bg={model.bg}
						textColor={model.textColor}
						style={{
							gridColumn: (idx % 3) + 1,
							gridRow: Math.floor(idx / 3) + 1,
						}}
					/>
				))}
			</div>
		);
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				height: '100vh',
				background: '#18181b',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<main
				style={{
					width: '100%',
					maxWidth: 1100,
					margin: '0 auto',
					background: 'rgba(255,255,255,0.04)',
					borderRadius: 24,
					boxShadow: '0 8px 40px 0 #0002',
					padding: '48px 24px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					height: '90vh',
					overflow: 'hidden',
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h1
						style={{
							color: 'white',
							fontSize: '2.5rem',
							fontWeight: 900,
							textAlign: 'center',
							marginBottom: 32,
							letterSpacing: 1,
						}}
					>
						Select Models to Compare
					</h1>
					<ModelSelectGrid
						selectedModels={selectedModels}
						onSelect={handleSelectModel}
					/>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: 40,
						}}
					>
						<button
							onClick={handleCompare}
							disabled={selectedModels.length === 0}
							style={{
								padding: '18px 48px',
								fontSize: '1.35rem',
								fontWeight: 700,
								borderRadius: 14,
								background:
									selectedModels.length === 0
										? '#b0b0b0'
										: 'linear-gradient(90deg, #2563eb 60%, #0ea5e9 100%)',
								color: 'white',
								border: 'none',
								boxShadow: '0 8px 32px 0 rgba(31,38,135,0.17)',
								cursor:
									selectedModels.length === 0 ? 'not-allowed' : 'pointer',
								transition: 'background 0.2s',
								letterSpacing: 1,
							}}
						>
							Compare
						</button>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
