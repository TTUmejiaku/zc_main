import styles from "../styles/TopBarSearchModal.module.css";
import { useState, useEffect, useContext } from "react";
import SearchModalResult from "./ModalAutoCompleteResult";
import { BigModal } from "./BigModal";
import { FilterItem } from "./FilterItem";
import { plugins } from "../utils/topbar-api";
import { ProfileContext } from "../context/profile-modal.context";
import { useTranslation } from "react-i18next";

const base_URL = "https://jsonplaceholder.typicode.com/todos";

const TopBarSearchModal = () => {
  const [value, setValue] = useState("");
  const [keys, setKeys] = useState("");
  const [filters, setFilters] = useState({});
  const [isSearchOpen, setOpenSearch] = useState(false);
  const [result, setResult] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { user } = useContext(ProfileContext);
  const { t } = useTranslation();

  let pluginName = window.location.href;
  let newName = pluginName.split("/");

  let exactPlugin = plugins.find(
    plugin => newName[3] === plugin.name || newName[3] === plugin.name + "#"
  );
  const ClearSearch = () => {
    setKeys("");
    setValue("");
  };
  const onSearchSubmit = async e => {
    if (e.keyCode === 13 && value.length >= 1) {
      setOpenSearch(true);
      const getResult = async () => {
        try {
          setLoading(true);
          let response = await exactPlugin.apiCall(
            user.org_id,
            user._id,
            value,
            keys
          );
          if (response.status >= 200 || response.status <= 299) {
            setResult(response.data.results.data);
          }
          setLoading(false);
        } catch (e) {
          setLoading(false);
          console.error(e);
        }
      };
      getResult();
    }
  };

  const onInputChange = e => {
    setValue(e.target.value);
  };
  useEffect(() => {
    async function getData() {
      if (!exactPlugin?.filterCall) {
        setFilters({});
        return;
      }
      try {
        const response = await exactPlugin.filterCall(user.org_id, user._id);

        if (response.status >= 200 || response.status <= 299) {
          setFilters(response.data.data);
        }
      } catch (e) {
        setFilters({});
      }
    }
    getData();
  }, [exactPlugin?.name, user._id]);

  const FilterList =
    filters === {} || !filters
      ? []
      : Object.keys(filters).map((item, i) => (
          <li key={i} className={styles.List}>
            <button
              onClick={e => {
                e.stopPropagation();
                setKeys(item);
              }}
              style={{ width: "100%", textAlign: "left" }}
            >
              <SearchModalResult title={filters[item]} />
            </button>
          </li>
        ));

  const handleSearchInputFocus = () => {
    const input = document.getElementById("searchCursor");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  };
  return (
    <div className={styles.topBarSearchModal}>
      <div className={styles._input}>
        {keys === "" ? null : (
          <FilterItem
            onRemove={() => {
              setKeys("");
            }}
            filter={filters[keys]}
          />
        )}
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={value}
          onChange={onInputChange}
          onKeyUp={onSearchSubmit}
          className={styles._input2}
          data-testid="topbar_search_input_testid"
          onFocus={handleSearchInputFocus}
        />
      </div>
      <div
        className={styles.MainBox}
        style={keys === "" ? {} : { display: "none" }}
      >
        <div>
          <div className={styles.input_box}>
            <div className={styles.grow}>
              <div className={styles.close_icon}>
                <svg
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
              </div>

              <input
                type="text"
                className={styles._MainInput}
                placeholder={t("search_placeholder")}
                value={value}
                onChange={onInputChange}
                onKeyUp={onSearchSubmit}
                autoFocus={"autofocus"}
                id="searchCursor"
                ref={ref => ref && ref.focus()}
              />
            </div>
            <div className={styles.close_icon}>
              <svg
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
            </div>
          </div>
        </div>
        <ul className={styles.ListWrapper}>
          {filters === {} ? (
            <li>
              <SearchModalResult title="" />
            </li>
          ) : (
            FilterList
          )}
        </ul>
      </div>
      {isSearchOpen ? (
        <BigModal
          isLoadingUp={isLoading}
          onClose={() => {
            setOpenSearch(false);
          }}
          result={result}
          inputValue={value}
          clearSearch={ClearSearch}
        />
      ) : null}
    </div>
  );
};

export default TopBarSearchModal;
