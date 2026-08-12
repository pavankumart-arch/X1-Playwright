import { Page, Locator, TestInfo, expect } from '@playwright/test';
import Inventorydata from '../../../testdata/Inventory/InventoryData.json';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

export class InventoryGeneralInformation extends BasePage {

  page: Page;

  // ============================================================
  // Search
  // ============================================================

  Search: Locator;

  // ============================================================
  // Main Page / Section
  // ============================================================

  GlobalInformationHeading: Locator;

  // ============================================================
  // Section Headings
  // ============================================================

  ColorHeading: Locator;
  EngineHeading: Locator;
  MechanicalHeading: Locator;
  MiscellaneousHeading: Locator;
  OEMCertificationInfoHeading: Locator;

  // ============================================================
  // Global Information Fields
  // ============================================================

  Stock: Locator;
  Mileage: Locator;
  Condition: Locator;
  DateInStock: Locator;
  Style: Locator;
  Type: Locator;
  Year: Locator;
  Make: Locator;
  Model: Locator;
  MarketClass: Locator;
  ModelSeries: Locator;
  ModelNumber: Locator;
  Trim: Locator;
  BodyStyle: Locator;
  DoorCount: Locator;

  // ============================================================
  // Color Fields
  // ============================================================

  ExteriorColorDescription: Locator;
  ExteriorColorCode: Locator;
  ExteriorGenericColor: Locator;
  InteriorColorDescription: Locator;
  InteriorColorCode: Locator;
  InteriorGenericColor: Locator;
  Upholstery: Locator;

  // ============================================================
  // Engine Fields
  // ============================================================

  EngineDescription: Locator;
  EngineBlockType: Locator;
  EngineAspirationType: Locator;
  EngineCylinderCount: Locator;
  EngineDisplacement: Locator;
  FuelType: Locator;
  FuelCapacity: Locator;

  // ============================================================
  // Mechanical Fields
  // ============================================================

  TransmissionName: Locator;
  NumberOfSpeeds: Locator;
  TransmissionDescription: Locator;
  DriveType: Locator;

  // ============================================================
  // Miscellaneous Fields
  // ============================================================

  WheelbaseCode: Locator;
  CityMilesPerGallon: Locator;
  HighwayMilesPerGallon: Locator;
  PassengerCapacity: Locator;
  WebsiteVDPURL: Locator;

  // ============================================================
  // OEM Certification Fields
  // ============================================================

  InspectionChecklistNo: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    this.page = page;

    // ============================================================
    // Search
    // ============================================================

    this.Search = page
      .locator('input[placeholder="Search..."]')
      .first();

    // ============================================================
    // Main Section
    // ============================================================

    this.GlobalInformationHeading = page
      .getByText('Global Information', {
        exact: true
      })
      .first();

    // ============================================================
    // Section Headings
    // ============================================================

    this.ColorHeading = page
      .getByText('Color', {
        exact: true
      })
      .first();

    this.EngineHeading = page
      .getByText('Engine', {
        exact: true
      })
      .first();

    this.MechanicalHeading = page
      .getByText('Mechanical', {
        exact: true
      })
      .first();

    this.MiscellaneousHeading = page
      .getByText('Miscellaneous', {
        exact: true
      })
      .first();

    this.OEMCertificationInfoHeading = page
      .getByText('OEM Certification Info', {
        exact: true
      })
      .first();

    // ============================================================
    // Global Information
    // ============================================================

    /*
     * IMPORTANT:
     * Stock is using the exact input ID from the HTML:
     *
     * <label for="admin-vehicle-detail-view-stockNumber">
     *     Stock #
     * </label>
     *
     * Therefore we directly locate the input instead of
     * searching for the label text "Stock".
     */

    this.Stock = this.page
      .locator('#admin-vehicle-detail-view-stockNumber');

    this.Mileage = this.getField('Mileage');

    this.Condition = this.getField('Condition');

    this.DateInStock = this.getField('Date In Stock');

    this.Style = this.getField('Style');

    this.Type = this.getField('Type');

    this.Year = this.getField('Year');

    this.Make = this.getField('Make');

    this.Model = this.getField('Model');

    this.MarketClass = this.getField('Market Class');

    this.ModelSeries = this.getField('Model Series');

    this.ModelNumber = this.getField('Model Number');

    this.Trim = this.getField('Trim');

    this.BodyStyle = this.getField('Body Style');

    this.DoorCount = this.getField('Door Count');

    // ============================================================
    // Color
    // ============================================================

    this.ExteriorColorDescription =
      this.getField('Exterior Color Description');

    this.ExteriorColorCode =
      this.getField('Exterior Color Code');

    this.ExteriorGenericColor =
      this.getField('Exterior Generic Color');

    this.InteriorColorDescription =
      this.getField('Interior Color Description');

    this.InteriorColorCode =
      this.getField('Interior Color Code');

    this.InteriorGenericColor =
      this.getField('Interior Generic Color');

    this.Upholstery =
      this.getField('Upholstery');

    // ============================================================
    // Engine
    // ============================================================

    this.EngineDescription =
      this.getField('Engine Description');

    this.EngineBlockType =
      this.getField('Engine Block Type');

    this.EngineAspirationType =
      this.getField('Engine Aspiration Type');

    this.EngineCylinderCount =
      this.getField('Engine Cylinder Count');

    this.EngineDisplacement =
      this.getField('Engine Displacement');

    this.FuelType =
      this.getField('Fuel Type');

    this.FuelCapacity =
      this.getField('Fuel Capacity');

    // ============================================================
    // Mechanical
    // ============================================================

    this.TransmissionName =
      this.getField('Transmission Name');

    this.NumberOfSpeeds =
      this.getField('Number of Speeds');

    this.TransmissionDescription =
      this.getField('Transmission Description');

    this.DriveType =
      this.getField('Drive Type');

    // ============================================================
    // Miscellaneous
    // ============================================================

    this.WheelbaseCode =
      this.getField('Wheelbase Code');

    this.CityMilesPerGallon =
      this.getField('City Miles Per Gallon');

    this.HighwayMilesPerGallon =
      this.getField('Highway Miles Per Gallon');

    this.PassengerCapacity =
      this.getField('Passenger Capacity');

    this.WebsiteVDPURL =
      this.getField('Website VDP URL');

    // ============================================================
    // OEM Certification Info
    // ============================================================

    this.InspectionChecklistNo =
      this.getField('Inspection Checklist No');
  }

  // ============================================================
  // Generic Field Locator
  // ============================================================

  private getField(fieldName: string): Locator {

    return this.page
      .getByText(fieldName, {
        exact: true
      })
      .first();
  }

  // ============================================================
  // Search Vehicle By VIN
  // ============================================================

  async searchForVIN(): Promise<void> {

    const vin = Inventorydata.VIN?.trim();

    if (!vin) {

      throw new Error(
        'VIN is empty or not defined in InventoryData.json'
      );
    }

    console.log(
      `VIN from test data: ${vin}`
    );

    // ------------------------------------------------------------
    // Search Field
    // ------------------------------------------------------------

    console.log(
      'Waiting for Inventory Search field...'
    );

    await expect(
      this.Search
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      'Inventory Search field is visible'
    );

    await this.Search.scrollIntoViewIfNeeded();

    await this.Search.click();

    console.log(
      'Clicked Inventory Search field'
    );

    // ------------------------------------------------------------
    // Clear
    // ------------------------------------------------------------

    await this.Search.fill('');

    // ------------------------------------------------------------
    // Enter VIN
    // ------------------------------------------------------------

    console.log(
      `Entering VIN: ${vin}`
    );

    await this.Search.fill(vin);

    // ------------------------------------------------------------
    // Verify VIN entered
    // ------------------------------------------------------------

    const searchValue =
      await this.Search.inputValue();

    console.log(
      `Search field value after fill: ${searchValue}`
    );

    if (
      searchValue.trim().toUpperCase() !==
      vin.toUpperCase()
    ) {

      throw new Error(
        `VIN was not entered correctly. Expected: ${vin}, Actual: ${searchValue}`
      );
    }

    console.log(
      'VIN successfully entered into Search field'
    );

    // ------------------------------------------------------------
    // Search
    // ------------------------------------------------------------

    await this.Search.press('Enter');

    console.log(
      'Pressed Enter to search VIN'
    );

    // ------------------------------------------------------------
    // Wait for VIN
    // ------------------------------------------------------------

    const vinLocator = this.page
      .getByText(vin, {
        exact: true
      })
      .first();

    console.log(
      'Waiting for VIN search result...'
    );

    await expect(
      vinLocator
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      `VIN found in inventory table: ${vin}`
    );

    // ------------------------------------------------------------
    // Click VIN
    // ------------------------------------------------------------

    await vinLocator.scrollIntoViewIfNeeded();

    await vinLocator.click();

    console.log(
      `Successfully clicked VIN: ${vin}`
    );

    // ------------------------------------------------------------
    // Wait for Vehicle Details
    // ------------------------------------------------------------

    await expect(
      this.GlobalInformationHeading
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      'Vehicle details page opened successfully'
    );
  }

  // ============================================================
  // Verify Section Heading
  // ============================================================

  private async verifySection(
    locator: Locator,
    sectionName: string,
    testInfo: TestInfo
  ): Promise<void> {

    const visible =
      await locator.isVisible().catch(() => false);

    Reporter.validateData(
      true,
      visible,
      `${sectionName} Section`,
      testInfo
    );

    if (visible) {

      console.log(
        `✅ ${sectionName} section is available`
      );

    } else {

      console.log(
        `❌ ${sectionName} section is NOT available`
      );
    }
  }

  // ============================================================
  // Verify Field
  // ============================================================

  private async verifyField(
    locator: Locator,
    fieldName: string,
    testInfo: TestInfo
  ): Promise<void> {

    const visible =
      await locator.isVisible().catch(() => false);

    Reporter.validateData(
      true,
      visible,
      fieldName,
      testInfo
    );

    if (visible) {

      console.log(
        `✅ ${fieldName} - Available`
      );

    } else {

      console.log(
        `❌ ${fieldName} - NOT Available`
      );
    }
  }

  // ============================================================
  // Verify Global Information Section
  // ============================================================

  async verifyGlobalInformation(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating Global Information section...'
    );

    await this.verifySection(
      this.GlobalInformationHeading,
      'Global Information',
      testInfo
    );

    // ============================================================
    // Global Information Fields
    // ============================================================

    await this.verifyField(
      this.Stock,
      'Stock',
      testInfo
    );

    await this.verifyField(
      this.Mileage,
      'Mileage',
      testInfo
    );

    await this.verifyField(
      this.Condition,
      'Condition',
      testInfo
    );

    await this.verifyField(
      this.DateInStock,
      'Date In Stock',
      testInfo
    );

    await this.verifyField(
      this.Style,
      'Style',
      testInfo
    );

    await this.verifyField(
      this.Type,
      'Type',
      testInfo
    );

    await this.verifyField(
      this.Year,
      'Year',
      testInfo
    );

    await this.verifyField(
      this.Make,
      'Make',
      testInfo
    );

    await this.verifyField(
      this.Model,
      'Model',
      testInfo
    );

    await this.verifyField(
      this.MarketClass,
      'Market Class',
      testInfo
    );

    await this.verifyField(
      this.ModelSeries,
      'Model Series',
      testInfo
    );

    await this.verifyField(
      this.ModelNumber,
      'Model Number',
      testInfo
    );

    await this.verifyField(
      this.Trim,
      'Trim',
      testInfo
    );

    await this.verifyField(
      this.BodyStyle,
      'Body Style',
      testInfo
    );

    await this.verifyField(
      this.DoorCount,
      'Door Count',
      testInfo
    );
  }

  // ============================================================
  // Verify Color Section
  // ============================================================

  async verifyColor(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating Color section...'
    );

    await this.verifySection(
      this.ColorHeading,
      'Color',
      testInfo
    );

    await this.verifyField(
      this.ExteriorColorDescription,
      'Exterior Color Description',
      testInfo
    );

    await this.verifyField(
      this.ExteriorColorCode,
      'Exterior Color Code',
      testInfo
    );

    await this.verifyField(
      this.ExteriorGenericColor,
      'Exterior Generic Color',
      testInfo
    );

    await this.verifyField(
      this.InteriorColorDescription,
      'Interior Color Description',
      testInfo
    );

    await this.verifyField(
      this.InteriorColorCode,
      'Interior Color Code',
      testInfo
    );

    await this.verifyField(
      this.InteriorGenericColor,
      'Interior Generic Color',
      testInfo
    );

    await this.verifyField(
      this.Upholstery,
      'Upholstery',
      testInfo
    );
  }

  // ============================================================
  // Verify Engine Section
  // ============================================================

  async verifyEngine(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating Engine section...'
    );

    await this.verifySection(
      this.EngineHeading,
      'Engine',
      testInfo
    );

    await this.verifyField(
      this.EngineDescription,
      'Engine Description',
      testInfo
    );

    await this.verifyField(
      this.EngineBlockType,
      'Engine Block Type',
      testInfo
    );

    await this.verifyField(
      this.EngineAspirationType,
      'Engine Aspiration Type',
      testInfo
    );

    await this.verifyField(
      this.EngineCylinderCount,
      'Engine Cylinder Count',
      testInfo
    );

    await this.verifyField(
      this.EngineDisplacement,
      'Engine Displacement',
      testInfo
    );

    await this.verifyField(
      this.FuelType,
      'Fuel Type',
      testInfo
    );

    await this.verifyField(
      this.FuelCapacity,
      'Fuel Capacity',
      testInfo
    );
  }

  // ============================================================
  // Verify Mechanical Section
  // ============================================================

  async verifyMechanical(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating Mechanical section...'
    );

    await this.verifySection(
      this.MechanicalHeading,
      'Mechanical',
      testInfo
    );

    await this.verifyField(
      this.TransmissionName,
      'Transmission Name',
      testInfo
    );

    await this.verifyField(
      this.NumberOfSpeeds,
      'Number of Speeds',
      testInfo
    );

    await this.verifyField(
      this.TransmissionDescription,
      'Transmission Description',
      testInfo
    );

    await this.verifyField(
      this.DriveType,
      'Drive Type',
      testInfo
    );
  }

  // ============================================================
  // Verify Miscellaneous Section
  // ============================================================

  async verifyMiscellaneous(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating Miscellaneous section...'
    );

    await this.verifySection(
      this.MiscellaneousHeading,
      'Miscellaneous',
      testInfo
    );

    await this.verifyField(
      this.WheelbaseCode,
      'Wheelbase Code',
      testInfo
    );

    await this.verifyField(
      this.CityMilesPerGallon,
      'City Miles Per Gallon',
      testInfo
    );

    await this.verifyField(
      this.HighwayMilesPerGallon,
      'Highway Miles Per Gallon',
      testInfo
    );

    await this.verifyField(
      this.PassengerCapacity,
      'Passenger Capacity',
      testInfo
    );

    await this.verifyField(
      this.WebsiteVDPURL,
      'Website VDP URL',
      testInfo
    );
  }

  // ============================================================
  // Verify OEM Certification Information
  // ============================================================

  async verifyOEMCertificationInfo(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '--------------------------------------------------'
    );

    console.log(
      'Validating OEM Certification Info section...'
    );

    await this.verifySection(
      this.OEMCertificationInfoHeading,
      'OEM Certification Info',
      testInfo
    );

    await this.verifyField(
      this.InspectionChecklistNo,
      'Inspection Checklist No',
      testInfo
    );
  }

  // ============================================================
  // Verify Complete Vehicle Information
  // ============================================================

  async vehicleInformation(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '=================================================='
    );

    console.log(
      'Starting Vehicle Information validation...'
    );

    console.log(
      '=================================================='
    );

    // ============================================================
    // Global Information
    // ============================================================

    await this.verifyGlobalInformation(
      testInfo
    );

    // ============================================================
    // Color
    // ============================================================

    await this.verifyColor(
      testInfo
    );

    // ============================================================
    // Engine
    // ============================================================

    await this.verifyEngine(
      testInfo
    );

    // ============================================================
    // Mechanical
    // ============================================================

    await this.verifyMechanical(
      testInfo
    );

    // ============================================================
    // Miscellaneous
    // ============================================================

    await this.verifyMiscellaneous(
      testInfo
    );

    // ============================================================
    // OEM Certification
    // ============================================================

    await this.verifyOEMCertificationInfo(
      testInfo
    );

    console.log(
      '=================================================='
    );

    console.log(
      'Vehicle Information validation completed.'
    );

    console.log(
      '=================================================='
    );
  }
}