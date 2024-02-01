import React, { ChangeEvent } from "react";
import { Select, MenuItem, Divider, ListItemText, ListItemIcon } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseProps, CoursePropsComponent, Language } from "types";
import { ContainerProps } from "./course-general-props-container";
import "./styles.scss";

export interface CompProps extends CoursePropsComponent, ContainerProps {}

function BlmCourseGeneralProps(props: CompProps) {
  const { data, languages, onChange } = props;
  const {
    title,
    shortDescription,
    description,
    keywords,
    objectives,
    language,
    duration,
    version,
    displayCourseName,
  } = data;
  const { t } = useTranslation("course-props");

  const updateChange = (newData: CourseProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const { target } = event;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;
    const name = target.name as string;
    const newData = { ...data, [name]: value };
    
    updateChange(newData);
  };

  const createLanguageItem = (item: Language) => {
    const { code, name, url } = item;

    return (
      <MenuItem key={code} value={code}>
        {url && (
          <ListItemIcon>
            <img src={url} alt={name} />
          </ListItemIcon>
        )}
        <ListItemText>{name}</ListItemText>
      </MenuItem>
    );
  };

  const createLanguageItems = () => {
    if (languages) {
      return [
        ...languages.primary.map(createLanguageItem),
        <Divider key="divider" />,
        ...languages.others.map(createLanguageItem),
      ];
    }
  };

  return (
    <div className="course-general-props-container">
      <span className="course-general-title-lbl">{t("general.name")}</span>
      <input
        name="title"
        type="text"
        maxLength={70}
        value={title}
        className="course-general-title-txt"
        onChange={handleChange}
      />
      <span className="course-general-brief-description-lbl">
        {t("general.display_course_name")}
      </span>
      <input
        name="displayCourseName"
        maxLength={70}
        value={displayCourseName}
        className="course-general-brief-description-txt"
        onChange={handleChange}
      />
      <span className="course-general-brief-description-lbl">{t("general.brief_description")}</span>
      <input
        name="shortDescription"
        type="brief description"
        maxLength={70}
        value={shortDescription}
        className="course-general-brief-description-txt"
        onChange={handleChange}
      />
      <span className="course-general-description-lbl">{t("general.full_description")}</span>
      <textarea
        name="description"
        maxLength={1000}
        value={description}
        className="course-general-description-txt"
        onChange={handleChange}
      />
      <span className="course-general-keyword-lbl">{t("general.keywords")}</span>
      <input
        name="keywords"
        type="text"
        maxLength={70}
        value={keywords}
        className="course-general-keyword-txt"
        onChange={handleChange}
      />
      <span className="course-general-objective-lbl">{t("general.learning_objectives")}</span>
      <textarea
        name="objectives"
        maxLength={700}
        value={objectives}
        className="course-general-objective-txt"
        onChange={handleChange}
      />
      <span className="course-general-language-lbl">{t("general.language")}</span>
      <Select
        displayEmpty
        name="language"
        value={language}
        MenuProps={{
          className: "course-general-language-dropdown-menu",
        }}
        className="course-general-language-dropdown"
        onChange={handleChange}
      >
        <MenuItem key="default" value="">
          Select
        </MenuItem>
        {createLanguageItems()}
      </Select>

      <div className="course-general-props-bottom-container">
        <span className="course-general-duration-lbl">{t("label.duration")}</span>
        <input
          name="duration"
          type="text"
          maxLength={70}
          value={duration}
          className="course-general-duration-txt"
          onChange={handleChange}
        />
        <span className="course-general-version-lbl">{t("general.version")}</span>
        <input
          name="version"
          type="text"
          maxLength={70}
          value={version}
          className="course-general-version-txt"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default BlmCourseGeneralProps;
