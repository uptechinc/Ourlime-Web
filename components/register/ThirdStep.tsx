'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button, Select, SelectItem } from '@nextui-org/react';
import styles from "./register.module.css";
import { countries } from 'countries-list';
import PhoneInput from 'react-phone-number-input';

type ThirdStepProps = {
	verificationMessage: string;
	setStep: Dispatch<SetStateAction<number>>;
	setCountry: Dispatch<SetStateAction<string>>;
	setBirthday: Dispatch<SetStateAction<string>>;
	setPhone: Dispatch<SetStateAction<string>>;
	phoneError?: string;
	isStepValid: boolean;
	validateStep: () => boolean;
	handleSubmit: (e: React.FormEvent) => void;
	countryError: string;
	birthdayError: string;
	error: string;
	setCity: Dispatch<SetStateAction<string>>;
	cityError: string;
	setPostalCode: Dispatch<SetStateAction<string>>;
	postalCodeError: string;
	setAddress: Dispatch<SetStateAction<string>>;
	AddressError: string;
	phone?: string;
	setZipCode: Dispatch<SetStateAction<string>>;
	zipCodeError: string;
};

const ThirdStep: React.FC<ThirdStepProps> = ({
	verificationMessage,
	setStep,
	setCountry,
	setBirthday,
	isStepValid,
	validateStep,
	handleSubmit,
	countryError,
	setPhone,
	phoneError,
	phone,
	error,
	setCity,
	cityError,
	setPostalCode,
	postalCodeError,
	setAddress,
	AddressError,
	setZipCode,
	zipCodeError,
}) => {
	const [attemptedNextStep, setAttemptedNextStep] = useState(false);

	useEffect(() => {
		validateStep();
	}, [setCountry, setBirthday, validateStep]);

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setAttemptedNextStep(true);
		if (isStepValid) {
			handleSubmit(e);
		}
	};

	const countryList = Object.entries(countries).map(([code, country]) => ({
		code,
		name: country.name,
	}));

	return (
		<div className="step-3 mx-auto">
			<h1 className="text-2xl font-bold text-white">
				Let the community know about you
			</h1>
			{error && <p className="text-red-500">{error}</p>}
			{attemptedNextStep && !isStepValid && (
				<h2 className="text-bold mt-1 text-left text-red-500">
					Oops, you forgot to input some data {`:'(`}
				</h2>
			)}
			{verificationMessage && (
				<p className="text-bold mt-4 text-left text-red-500">
					{verificationMessage}
				</p>
			)}
			<form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-4">
			<div className='flex flex-col gap-4 md:flex-row md:gap-10'>
			<div className="w-full md:w-1/2 ">
			<div className="relative">
			<input
					type="text"
					className="w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					placeholder="City (Optional)"
					onChange={(e) => setCity(e.target.value)}
				/>
				{attemptedNextStep && cityError && (
					<p className="text-bold mt-1 text-left text-red-500">
						{cityError}
					</p>
				)}
				</div>
				</div>
				<div className="w-full md:w-1/2 ">
				<div className="relative">
				<input
					type="text"
					className="w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					placeholder="Region (Optional)"
					onChange={(e) => setAddress(e.target.value)}
				/>
				
				</div>
				</div>
				</div>
				<Select
					placeholder="Country"
					onChange={(e) => setCountry(e.target.value)}
					className={`${styles.nextuiInput} w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500`}
					classNames={{
						base: "text-white",
						trigger: "text-white",
						value: "text-white"
					}}
				>
					{countryList.map((country) => (
						<SelectItem key={country.code} value={country.name}>
							{country.name}
						</SelectItem>
					))}
				</Select>
				{attemptedNextStep && countryError && (
					<p className="text-bold mt-1 text-left text-red-500">
						{countryError}
					</p>
				)}
				<input
					type="text"
					className="w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					placeholder="Address (Optional)"
					onChange={(e) => setAddress(e.target.value)}
				/>
				{attemptedNextStep && AddressError && (
					<p className="text-bold mt-1 text-left text-red-500">
						{AddressError}
					</p>
				)}
					<PhoneInput
						value={phone}
						className="phone"
						defaultCountry="TT"
						onChange={(value) => setPhone(value ?? '')}
						inputClass="w-full rounded-md border-none bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					/>
				{attemptedNextStep && phoneError && (
					<p className="text-bold mt-1 text-left text-red-500">{phoneError}</p>
				)}
				
				<div className='flex flex-col gap-4 md:flex-row md:gap-10'>
			<div className="w-full md:w-1/2 ">
			<div className="relative">
				<input
					type="text"
					className="w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					placeholder="Zip Code (Optional)"
					onChange={(e) => setZipCode(e.target.value)}
				/>
				{attemptedNextStep && zipCodeError && (
					<p className="text-bold mt-1 text-left text-red-500">
						{zipCodeError}
					</p>
				)}
				</div>	
				</div>
				
			<div className="w-full md:w-1/2 ">
			<div className="relative">
				<input
					type="text"
					className="w-full rounded-md border border-none border-gray-300 bg-greenForm px-4 py-2 text-white placeholder-white focus:border-green-500 focus:outline-none focus:ring-green-500"
					placeholder="Postal Code (Optional)"
					onChange={(e) => setPostalCode(e.target.value)}
				/>
				{attemptedNextStep && postalCodeError && (
					<p className="text-bold mt-1 text-left text-red-500">
						{postalCodeError}
					</p>
				)}
				</div>
				</div>
				</div>
				<div className="flex w-full flex-col gap-1 md:gap-12 md:flex-row md:px-20">
					<Button
						onClick={() => setStep(2)}
						type="button"
						className="submit my-4 w-full rounded-full bg-white px-4 py-2 text-greenTheme hover:bg-gray-300"
					>
						Previous Step
					</Button>
					<Button
						onClick={() => setStep(4)}
						type="submit"
						className="submit my-4 w-full rounded-full bg-greenTheme px-4 py-2 text-white hover:bg-green-600"
					>
						Confirm
					</Button>
				</div>
			</form>
		</div>
	);
};

export default ThirdStep;
