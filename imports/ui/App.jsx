import React, { useState, useEffect, useCallback } from "react";
import { withTracker } from "meteor/react-meteor-data";
import Chart from "./chart.component";
import styled from "styled-components";
import FilterButtons from "./components/FilterButtons.component";

import ReactTooltip from "react-tooltip";
import { isMobile } from "react-device-detect";
import NumberFormat from "react-number-format";
import Switch from "react-switch";

import SearchSelectInput from "./components/SearchSelectInput.component";

import { interpolateExisting } from "../utility/interpolate";
import TRANSLATIONS from "../interface/TRANSLATIONS";
import WorldDataPannel from "./components/WorldDataPannel.component";

const Records = new Mongo.Collection("records");
const Lands = new Mongo.Collection("lands");

const getYesterdayDateISO = () => {
	let yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday.toISOString().substr(0, 10);
};

const App = () => {
	const [worldData, setWorldData] = useState(null);
	const [worldDataObj, setWorldDataObj] = useState(null);
	const [landsNames, setLandsNames] = useState([]);
	const [mode, setMode] = useState("find");
	const [selectionMode, setSelectionMode] = useState("list");
	const [selectedLand, setSelectedLand] = useState("Switzerland");
	const [selectedLand2, setSelectedLand2] = useState("France");
	const [land1_data, setLand1_data] = useState(null);
	const [land2_data, setLand2_data] = useState(null);
	const [compareCriterion, setCompareCriterion] = useState("Confirmés");
	const [showSourcesList, setShowSourcesList] = useState(false);
	const [displayedCriterions, setDisplayedCriterions] = useState([
		"Confirmés",
		"Existants",
		"Décédés",
	]);
	const [interpolate, setInterpolate] = useState(true);
	const [enablePrediction, setEnablePrediction] = useState(false);
	const [language, setLanguage] = useState("french");
	const [pointedDate, setPointedDate] = useState(null);

	useEffect(() => {
		document.addEventListener("keydown", keydownHandler);
		return () => {
			document.removeEventListener("keydown", keydownHandler);
		};
	}, [selectedLand, landsNames]);

	useEffect(() => {
		Meteor.call("getLandsNames", (err, lands) => {
			const sortedLands = lands.sort((a, b) =>
				a.confirmed < b.confirmed ? 1 : -1
			);
			console.log(sortedLands);
			setLandsNames(sortedLands);
		});
	}, []);

	useEffect(() => {
		Meteor.call("getLandData", selectedLand, (err, resData) => {
			setLand1_data(resData);
		});
	}, [selectedLand]);

	useEffect(() => {
		Meteor.call("getLandData", selectedLand2, (err, resData) => {
			setLand2_data(resData);
		});
	}, [selectedLand2]);

	const keydownHandler = useCallback(
		(e) => {
			if ([39, 40].includes(e.keyCode)) {
				e.preventDefault();
				const index = landsNames.indexOf(selectedLand) + 1;
				if (landsNames[index] !== undefined) {
					setSelectedLand(landsNames[index]);
				}
			} else if ([37, 38].includes(e.keyCode)) {
				e.preventDefault();
				const index = landsNames.indexOf(selectedLand) - 1;
				if (landsNames[index] !== undefined) {
					setSelectedLand(landsNames[index]);
				}
			}
		},
		[selectedLand, landsNames]
	);

	const toggleSourcesListHandler = useCallback(() => {
		setShowSourcesList(!showSourcesList);
	}, [showSourcesList]);

	const tr = useCallback(
		(sentence) => {
			if (language !== "french") {
				return TRANSLATIONS[language][sentence];
			}
			return sentence;
		},
		[language]
	);

	const formatNumber = useCallback((value) => (
		<NumberFormat value={value} displayType={"text"} thousandSeparator={"'"} />
	));

	if (isMobile) {
		return (
			<React.Fragment>
				<div style={{ ...styles.body, paddingBottom: "2rem" }}>
					<div style={styles.mobileContainer}>
						{land1_data && land1_data && (
							<Chart
								land1_data={land1_data}
								land2_data={land2_data}
								lands={landsNames}
								land={selectedLand}
								land2={selectedLand2}
								mode={mode}
								criterion={compareCriterion}
								displayedCriterions={displayedCriterions}
								interpolate={interpolate}
								tr={tr}
							/>
						)}
					</div>
					<Toolbar
						style={{
							width: "100%",
							marginBottom: 40,
							justifyContent: "center",
						}}>
						<FilterButtons
							shape='squared'
							squaredRadius={10}
							borderWidth={2}
							buttonBackgroundColor='#ccd8ff'
							selectedButtonBackgroundColor='#6571A0'
							buttonBorderColor='#a2aac4'
							style={{
								marginTop: 50,
								width: "50%",
								height: "7rem",
								fontSize: "2.5rem",
							}}
							buttons={[
								{ value: "find", label: tr("Trouver") },
								{ value: "compare", label: tr("Comparer") },
							]}
							selectedButtons={mode}
							onSwitch={(value) => {
								setMode(value);
							}}
						/>
					</Toolbar>
					<Toolbar
						style={{
							width: "100%",
							marginBottom: 40,
							justifyContent: "center",
						}}>
						<select
							value={selectedLand}
							style={{
								width: "70%",
								height: "7rem",
								fontSize: "2.5rem",
								borderRadius: 5,
								padding: "0.5rem",
							}}
							onChange={({ currentTarget: { value } }) => {
								setSelectedLand(value);
							}}>
							{landsNames.length > 0 &&
								landsNames.map((land) => (
									<option key={land.country} value={land.country}>
										{land.country} ({land.confirmed})
									</option>
								))}
						</select>
					</Toolbar>
					{mode === "compare" && (
						<Toolbar
							style={{
								width: "100%",
								marginBottom: 40,
								justifyContent: "center",
							}}>
							<select
								value={selectedLand2}
								style={{
									width: "70%",
									height: "7rem",
									fontSize: "2.5rem",
									borderRadius: 5,
									padding: "0.5rem",
								}}
								onChange={({ currentTarget: { value } }) => {
									setSelectedLand2(value);
								}}>
								{landsNames.map((landKey) => (
									<option key={landKey} value={landKey}>
										{landKey} (
										{data[landKey][data[landKey].length - 1]["Confirmés"]})
									</option>
								))}
							</select>
						</Toolbar>
					)}
					{mode === "find" && (
						<Toolbar
							style={{
								width: "100%",
								marginBottom: 40,
								justifyContent: "center",
							}}>
							<FilterButtons
								roundedRadius={50}
								borderWidth={2}
								style={{ width: "90%", fontSize: "2.5rem", height: "7rem" }}
								buttons={[
									{ value: "Confirmés", label: tr("Total") },
									{ value: "Rétablis", label: tr("Rétablis") },
									{ value: "Décédés", label: tr("Décédés") },
									{ value: "Existants", label: tr("Existants") },
								]}
								selectedButtons={displayedCriterions}
								onSwitch={(value) => {
									if (displayedCriterions.includes(value)) {
										if (displayedCriterions.length > 1) {
											if (!enablePrediction) {
												setDisplayedCriterions(
													displayedCriterions.filter(
														(buttonValue) => buttonValue !== value
													)
												);
											}
										}
									} else {
										setDisplayedCriterions([...displayedCriterions, value]);
									}
								}}
							/>
						</Toolbar>
					)}
					{mode === "compare" && (
						<Toolbar
							style={{
								width: "100%",
								marginBottom: 40,
								justifyContent: "center",
							}}>
							<FilterButtons
								roundedRadius={50}
								borderWidth={2}
								style={{ width: "90%", fontSize: "2.5rem", height: "7rem" }}
								buttons={[
									{ value: "Confirmés", label: tr("Total") },
									{ value: "Rétablis", label: tr("Rétablis") },
									{ value: "Décédés", label: tr("Décédés") },
								]}
								selectedButtons={compareCriterion}
								onSwitch={(value) => {
									setCompareCriterion(value);
								}}
							/>
						</Toolbar>
					)}
					<hr style={{ width: "90%" }} />
					<Toolbar
						style={{ width: "100%", marginTop: 40, justifyContent: "center" }}>
						<select
							value={language}
							style={{
								height: "7rem",
								fontSize: "2.5rem",
								borderRadius: 5,
								width: "40%",
								padding: "0.5rem",
							}}
							onChange={({ currentTarget: { value } }) => {
								setLanguage(value);
							}}>
							<option value='french'>Français</option>
							<option value='german'>Deutsch</option>
							<option value='italian'>Italiano</option>
							<option value='english'>English</option>
							<option value='español'>Español</option>
						</select>
						<div
							style={{
								display: "flex",
								width: "50%",
								justifyContent: "space-between",
							}}>
							{mode === "find" &&
								!["World", "World, excl. China"].includes(selectedLand) && (
									<React.Fragment>
										<div
											style={{
												marginRight: 5,
												height: "7rem",
												lineHeight: "7rem",
												verticalAlign: "middle",
												display: "inline-block",
											}}>
											<span
												style={{
													marginLeft: 40,
													marginRight: 10,
													fontSize: "2.5rem",
												}}>
												{tr("interpoler")}
											</span>
										</div>
										<Switch
											onChange={(checked) => {
												setInterpolate(checked);
											}}
											checked={interpolate}
											offColor='#CCD8FF'
											onColor='#6571A0'
											width={220}
											height={112}
										/>
									</React.Fragment>
								)}
						</div>
					</Toolbar>
				</div>
				<Footer
					toggleSourcesListHandler={toggleSourcesListHandler}
					showSourcesList={showSourcesList}
				/>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<div style={styles.body}>
				<div style={{ height: 40 }} />
				<Toolbar
					style={{
						width: 1100,
						marginLeft: "auto",
						marginRight: "auto",
						marginBottom: 40,
					}}>
					<FilterButtons
						shape='squared'
						buttonBackgroundColor='#ccd8ff'
						selectedButtonBackgroundColor='#6571A0'
						buttonBorderColor='#a2aac4'
						style={{ width: 165 }}
						buttons={[
							{ value: "find", label: tr("Trouver") },
							{ value: "compare", label: tr("Comparer") },
							// {value: 'learn', label: tr('S\'informer')}
						]}
						selectedButtons={mode}
						onSwitch={(value) => {
							setMode(value);
						}}
					/>
					{mode === "find" && (
						<FilterButtons
							style={{ width: 300 }}
							buttons={[
								{ value: "Confirmés", label: tr("Total") },
								{ value: "Rétablis", label: tr("Rétablis") },
								{ value: "Décédés", label: tr("Décédés") },
								{ value: "Existants", label: tr("Existants") },
							]}
							selectedButtons={displayedCriterions}
							onSwitch={(value) => {
								if (displayedCriterions.includes(value)) {
									if (displayedCriterions.length > 1) {
										setDisplayedCriterions(
											displayedCriterions.filter(
												(buttonValue) => buttonValue !== value
											)
										);
									}
								} else {
									setDisplayedCriterions([...displayedCriterions, value]);
								}
							}}
						/>
					)}
					{mode === "find" && (
						<FilterButtons
							style={{ width: 170 }}
							buttons={[
								{ value: "search", label: tr("Recherche") },
								{ value: "list", label: tr("Liste") },
							]}
							selectedButtons={selectionMode}
							onSwitch={(value) => {
								setSelectionMode(value);
							}}
						/>
					)}
					{mode === "compare" && (
						<FilterButtons
							style={{ width: 250 }}
							buttons={[
								{ value: "Confirmés", label: tr("Total") },
								{ value: "Rétablis", label: tr("Rétablis") },
								{ value: "Décédés", label: tr("Décédés") },
							]}
							selectedButtons={compareCriterion}
							onSwitch={(value) => {
								setCompareCriterion(value);
							}}
						/>
					)}
					{(selectionMode === "list" && mode !== "learn") ||
					mode === "compare" ? (
						<select
							value={selectedLand}
							style={styles.input}
							onChange={({ currentTarget: { value } }) => {
								setSelectedLand(value);
							}}>
							{landsNames.length > 0 &&
								landsNames.map((land) => (
									<option key={land.country} value={land.country}>
										{land.country} ({land.confirmed})
									</option>
								))}
						</select>
					) : (
						mode !== "learn" && (
							<div>
								<SearchSelectInput
									style={styles.input}
									onSearch={(text) => {
										if (text !== "") {
											const regex = new RegExp(`${text}`, "i");
											return landsNames
												.filter((land) => regex.test(land.country))
												.map((land) => {
													console.log(land.country);
													return {
														value: land.country,
														label: land.country,
													};
												});
										} else {
											return [];
										}
									}}
									onSelect={(key) => {
										setSelectedLand(key);
									}}
								/>
							</div>
						)
					)}
					{mode === "compare" && (
						<React.Fragment>
							<select
								value={selectedLand2}
								style={styles.input}
								onChange={({ currentTarget: { value } }) => {
									setSelectedLand2(value);
								}}>
								{landsNames.length > 0 &&
									landsNames.map((land) => (
										<option key={land.country} value={land.country}>
											{land.country} ({land.confirmed})
										</option>
									))}
							</select>
						</React.Fragment>
					)}
					<select
						value={language}
						style={{ height: 36, fontSize: 18, borderRadius: 5, minWidth: 100 }}
						onChange={({ currentTarget: { value } }) => {
							setLanguage(value);
						}}>
						<option value='french'>Français</option>
						<option value='german'>Deutsch</option>
						<option value='italian'>Italiano</option>
						<option value='english'>English</option>
						<option value='español'>Español</option>
					</select>
				</Toolbar>
				<div style={styles.container}>
					{land1_data ? (
						<div style={{ position: "relative" }}>
							{mode === "find" &&
								!isMobile &&
								!["World", "World, excl. China"].includes(selectedLand) && (
									<div
										style={{
											position: "absolute",
											display: "flex",
											left: 20,
											top: 20,
											zIndex: 10,
											backgroundColor: "white",
										}}
										data-tip='permet de combler les données absentes'>
										<ReactTooltip backgroundColor='#6571A0' />
										<div
											style={{
												marginRight: 5,
												height: 30,
												lineHeight: "30px",
												verticalAlign: "middle",
												display: "inline-block",
											}}>
											{tr("interpolation des données")}
										</div>
										<Switch
											onChange={(checked) => {
												setInterpolate(checked);
											}}
											checked={interpolate}
											offColor='#CCD8FF'
											onColor='#6571A0'
										/>
									</div>
								)}
							{mode === "find" && !isMobile && (
								<div
									style={{
										position: "absolute",
										display: "flex",
										right: 40,
										top: 20,
										zIndex: 10,
										backgroundColor: "white",
									}}
									data-html={true}
									data-tip='<div style="width: 150">extrapolation mathématique visant à faire ressortir<br />des tendances (pas de modèle épidémiologique)</div>'>
									<ReactTooltip backgroundColor='#6571A0' />
									<div
										style={{
											marginRight: 5,
											height: 30,
											lineHeight: "30px",
											verticalAlign: "middle",
											display: "inline-block",
										}}>
										{tr("prédiction")}
									</div>
									<Switch
										onChange={(checked) => {
											setEnablePrediction(checked);
										}}
										checked={enablePrediction}
										offColor='#CCD8FF'
										onColor='#6571A0'
									/>
								</div>
							)}
							{!isMobile && selectedLand !== "World" && (
								<WorldDataPannel
									worldDataObj={worldDataObj}
									tr={tr}
									formatNumber={formatNumber}
									pointedDate={pointedDate}
									getYesterdayDateISO={getYesterdayDateISO}
								/>
							)}
							{land1_data && land2_data && (
								<Chart
									land1_data={land1_data}
									land2_data={land2_data}
									lands={landsNames}
									land={selectedLand}
									land2={selectedLand2}
									mode={mode}
									criterion={compareCriterion}
									displayedCriterions={displayedCriterions}
									interpolate={interpolate}
									enablePrediction={enablePrediction}
									tr={tr}
									setPointedDate={setPointedDate}
								/>
							)}
							{(selectedLand === "Switzerland" ||
								(selectedLand2 === "Switzerland" && mode === "compare")) && (
								<div
									style={{
										position: "absolute",
										width: "100%",
										left: 0,
										top: 598,
										textAlign: "center",
									}}>
									{/* <span style={{color: '#db5e5e'}}><b>Suisse:</b> à partir du 10.03.2020, seules les personnes à risque sont testées, les statisques sont donc faussées en conséquence.</span> */}
								</div>
							)}
						</div>
					) : (
						<div
							style={{
								width: "100%",
								height: 578,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}>
							<img
								style={{ color: "green" }}
								src='/spinner.svg'
								alt='spinner'
							/>
						</div>
					)}
				</div>
			</div>
			{
				<footer>
					<Footer
						toggleSourcesListHandler={toggleSourcesListHandler}
						showSourcesList={showSourcesList}
					/>
				</footer>
			}
		</React.Fragment>
	);
};

const Footer = ({ toggleSourcesListHandler, showSourcesList }) => {
	return (
		<div style={{ marginTop: 40, textAlign: "center", color: "#e3e5ef" }}>
			Les données proviennent de{" "}
			<a style={styles.link} href='https://systems.jhu.edu/'>
				Johns Hopkins University CSSE
			</a>{" "}
			(
			<a
				id='source'
				href='#source'
				style={styles.link}
				onClick={toggleSourcesListHandler}>
				sources
			</a>
			,&nbsp;
			<a
				style={styles.link}
				href='https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports'>
				données
			</a>
			) - Certaines statistiques sont susceptibles d'être inexactes (sources
			multiples) voire absentes.
			<br />
			{showSourcesList && (
				<div style={styles.sourcesList}>
					<ul>
						<li>World Health Organization (WHO)</li>
						<li>DXY.cn. Pneumonia. 2020</li>
						<li>BNO News</li>
						<li>
							National Health Commission of the People’s Republic of China
						</li>
						<li>China CDC (CCDC)</li>
						<li>Hong Kong Department of Health</li>
						<li>Macau Government</li>
						<li>Taiwan CDC</li>
						<li>US CDC</li>
						<li>Government of Canada</li>
						<li>Australia Government Department of Health</li>
						<li>European Centre for Disease Prevention and Control (ECDC)</li>
						<li>Ministry of Health Singapore (MOH)</li>
						<li>Italy Ministry of Health</li>
					</ul>
				</div>
			)}
			<br />
			Vous êtes à la recherche d'un développeur ? {isMobile && <br />}(web,
			mobile, server){isMobile && <br />}
			{isMobile && <br />}
			<a
				style={{ marginLeft: 10, color: "#c6fff7" }}
				href='mailto:zappala.jonathan@gmail.com'>
				zappala.jonathan@gmail.com
			</a>
			{isMobile ? <br /> : <span>&nbsp;-&nbsp;</span>}
			<a
				style={styles.link}
				href='https://www.linkedin.com/in/jonathan-zappala-575a8b14b/'>
				LinkedIn
			</a>
			{isMobile ? <br /> : <span>&nbsp;-&nbsp;</span>}
			<a style={styles.link} href='https://www.malt.fr/profile/jonathanzappala'>
				Malt
			</a>
			{isMobile ? <br /> : <span>&nbsp;-&nbsp;</span>}
			<a style={styles.link} href='https://www.facebook.com/jonathan.zappala.9'>
				Facebook
			</a>
			<div
				style={{
					marginTop: 50,
					...(isMobile
						? {
								width: "100%",
								padding: 10,
								textAlign: "justify",
								boxSizing: "border-box",
						  }
						: { maxWidth: 640, textAlign: "left" }),
					marginLeft: "auto",
					marginRight: "auto",
				}}>
				<h4 style={{ textAlign: "center" }}>
					Informations concernant l'utilisation de cette application
				</h4>
				Les données présentées ici appartiennent au domaine public et sont
				fournies sans aucune garantie. L'exploitation de ces informations par
				l'intermédiaire de cette application est strictement réservé à un usage
				éducatif et à la recherche. Un usage dans un cadre médical ou à des fins
				commerciales est strictement interdit. La licence exposée ci-dessous
				concerne l'application à proprement parler (code et fonctionnalités), en
				aucun cas les données présentées.
			</div>
			<div
				style={{
					padding: 20,
					marginTop: 50,
					textAlign: "justify",
					backgroundColor: "rgba(0, 0, 0, 0.25)",
					border: "1px solid #576068",
					color: "#e3e5ef",
				}}>
				<div style={{ textAlign: "center" }}>
					Covid19-graph application MIT License © 2020 Jonathan Zappalà
				</div>
				<br />
				Permission is hereby granted, free of charge, to any person obtaining a
				copy of this software and associated documentation files (the
				"Software"), to deal in the Software without restriction, including
				without limitation the rights to use, copy, modify, merge, publish,
				distribute, sublicense, and/or sell copies of the Software, and to
				permit persons to whom the Software is furnished to do so, subject to
				the following conditions: The above copyright notice and this permission
				notice shall be included in all copies or substantial portions of the
				Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
				KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
				IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
				CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
				TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
				SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
			</div>
		</div>
	);
};

const styles = {
	body: {
		backgroundColor: "#f4f5f9",
		height: "100%",
		paddingBottom: 60,
		borderRadius: 10,
	},
	container: {
		width: 1100,
		marginLeft: "auto",
		marginRight: "auto",
		backgroundColor: "white",
	},
	mobileContainer: {
		width: "100%",
		marginLeft: "auto",
		marginRight: "auto",
		backgroundColor: "white",
		overflowX: "scroll",
	},
	input: {
		boxSizing: "border-box",
		height: 36,
		fontSize: 18,
		borderRadius: 5,
		outline: "none",
		width: 230,
	},
	sourcesList: {
		marginLeft: "auto",
		marginRight: "auto",
		textAlign: "left",
		width: 450,
		marginTop: 20,
		marginBottom: 0,
		borderStyle: "solid",
		borderColor: "#cccfdd",
		borderWidth: 1,
		backgroundColor: "#F4F5F9",
		color: "#444",
	},
	link: {
		color: "#c6fff7",
	},
};

const Toolbar = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 100%;
	background-color: transparent;

	select {
		background-color: white;
		outline: none;
		min-width: 200px;
	}
`;

export default App;
