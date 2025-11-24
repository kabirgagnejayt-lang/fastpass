
'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import React, { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"
import { format, parseISO } from "date-fns"

interface DynamicProfileInputProps {
    id: string
    label: string
    value: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | boolean | Date, fieldId: string) => void
    disabled?: boolean
    required?: boolean;
}

const pronouns = ["He/Him", "She/Her", "They/Them", "Other"];
const ageGroups = ["Under 18", "18+"];
const contactPreferences = ["Email", "Phone", "DM"];
const professionalStatuses = ["Open to Work", "Not Looking", "Freelance/Contract"];
const themePreferences = ["Light", "Dark", "System"];
const notificationPreferences = ["Enabled", "Disabled"];
const twoFactorPreferences = ["Email", "SMS", "None"];
const osPreferences = ["Windows", "macOS", "iOS", "Android", "Linux"];
const accountVisibilities = ["Public", "Private"];
const dataSharingConsents = [{ label: "Yes, share my data", value: true }, { label: "No, do not share", value: false }];
const marketingOptIns = [{ label: "Yes, I want marketing emails", value: true }, { label: "No, please don't", value: false }];
const sessionTimeouts = ["15 minutes", "30 minutes", "1 hour", "Never"];
const paymentMethods = ["Card", "PayPal", "Crypto", "None"];

export const countryCodes = [
    { value: '+93', label: 'Afghanistan (+93)' },
    { value: '+355', label: 'Albania (+355)' },
    { value: '+213', label: 'Algeria (+213)' },
    { value: '+1-684', label: 'American Samoa (+1-684)' },
    { value: '+376', label: 'Andorra (+376)' },
    { value: '+244', label: 'Angola (+244)' },
    { value: '+1-264', label: 'Anguilla (+1-264)' },
    { value: '+1-268', label: 'Antigua and Barbuda (+1-268)' },
    { value: '+54', label: 'Argentina (+54)' },
    { value: '+374', label: 'Armenia (+374)' },
    { value: '+297', label: 'Aruba (+297)' },
    { value: '+61', label: 'Australia (+61)' },
    { value: '+43', label: 'Austria (+43)' },
    { value: '+994', label: 'Azerbaijan (+994)' },
    { value: '+1-242', label: 'Bahamas (+1-242)' },
    { value: '+973', label: 'Bahrain (+973)' },
    { value: '+880', label: 'Bangladesh (+880)' },
    { value: '+1-246', label: 'Barbados (+1-246)' },
    { value: '+375', label: 'Belarus (+375)' },
    { value: '+32', label: 'Belgium (+32)' },
    { value: '+501', label: 'Belize (+501)' },
    { value: '+229', label: 'Benin (+229)' },
    { value: '+1-441', label: 'Bermuda (+1-441)' },
    { value: '+975', label: 'Bhutan (+975)' },
    { value: '+591', label: 'Bolivia (+591)' },
    { value: '+387', label: 'Bosnia and Herzegovina (+387)' },
    { value: '+267', label: 'Botswana (+267)' },
    { value: '+55', label: 'Brazil (+55)' },
    { value: '+246', label: 'British Indian Ocean Territory (+246)' },
    { value: '+1-284', label: 'British Virgin Islands (+1-284)' },
    { value: '+673', label: 'Brunei (+673)' },
    { value: '+359', label: 'Bulgaria (+359)' },
    { value: '+226', label: 'Burkina Faso (+226)' },
    { value: '+257', label: 'Burundi (+257)' },
    { value: '+855', label: 'Cambodia (+855)' },
    { value: '+237', label: 'Cameroon (+237)' },
    { value: '+1', label: 'Canada (+1)' },
    { value: '+238', label: 'Cape Verde (+238)' },
    { value: '+1-345', label: 'Cayman Islands (+1-345)' },
    { value: '+236', label: 'Central African Republic (+236)' },
    { value: '+235', label: 'Chad (+235)' },
    { value: '+56', label: 'Chile (+56)' },
    { value: '+86', label: 'China (+86)' },
    { value: '+61_B', label: 'Christmas Island (+61)' },
    { value: '+61_C', label: 'Cocos Islands (+61)' },
    { value: '+57', label: 'Colombia (+57)' },
    { value: '+269', label: 'Comoros (+269)' },
    { value: '+682', label: 'Cook Islands (+682)' },
    { value: '+506', label: 'Costa Rica (+506)' },
    { value: '+385', label: 'Croatia (+385)' },
    { value: '+53', label: 'Cuba (+53)' },
    { value: '+599', label: 'Curacao (+599)' },
    { value: '+357', label: 'Cyprus (+357)' },
    { value: '+420', label: 'Czech Republic (+420)' },
    { value: '+243', label: 'Democratic Republic of the Congo (+243)' },
    { value: '+45', label: 'Denmark (+45)' },
    { value: '+253', label: 'Djibouti (+253)' },
    { value: '+1-767', label: 'Dominica (+1-767)' },
    { value: '+1-809', label: 'Dominican Republic (+1-809)' },
    { value: '+1-829', label: 'Dominican Republic (+1-829)' },
    { value: '+1-849', label: 'Dominican Republic (+1-849)' },
    { value: '+670', label: 'East Timor (+670)' },
    { value: '+593', label: 'Ecuador (+593)' },
    { value: '+20', label: 'Egypt (+20)' },
    { value: '+503', label: 'El Salvador (+503)' },
    { value: '+240', label: 'Equatorial Guinea (+240)' },
    { value: '+291', label: 'Eritrea (+291)' },
    { value: '+372', label: 'Estonia (+372)' },
    { value: '+251', label: 'Ethiopia (+251)' },
    { value: '+500', label: 'Falkland Islands (+500)' },
    { value: '+298', label: 'Faroe Islands (+298)' },
    { value: '+679', label: 'Fiji (+679)' },
    { value: '+358', label: 'Finland (+358)' },
    { value: '+33', label: 'France (+33)' },
    { value: '+594', label: 'French Guiana (+594)' },
    { value: '+689', label: 'French Polynesia (+689)' },
    { value: '+241', label: 'Gabon (+241)' },
    { value: '+220', label: 'Gambia (+220)' },
    { value: '+995', label: 'Georgia (+995)' },
    { value: '+49', label: 'Germany (+49)' },
    { value: '+233', label: 'Ghana (+233)' },
    { value: '+350', label: 'Gibraltar (+350)' },
    { value: '+30', label: 'Greece (+30)' },
    { value: '+299', label: 'Greenland (+299)' },
    { value: '+1-473', label: 'Grenada (+1-473)' },
    { value: '+590', label: 'Guadeloupe (+590)' },
    { value: '+1-671', label: 'Guam (+1-671)' },
    { value: '+502', label: 'Guatemala (+502)' },
    { value: '+44-1481', label: 'Guernsey (+44-1481)' },
    { value: '+224', label: 'Guinea (+224)' },
    { value: '+245', label: 'Guinea-Bissau (+245)' },
    { value: '+592', label: 'Guyana (+592)' },
    { value: '+509', label: 'Haiti (+509)' },
    { value: '+504', label: 'Honduras (+504)' },
    { value: '+852', label: 'Hong Kong (+852)' },
    { value: '+36', label: 'Hungary (+36)' },
    { value: '+354', label: 'Iceland (+354)' },
    { value: '+91', label: 'India (+91)' },
    { value: '+62', label: 'Indonesia (+62)' },
    { value: '+98', label: 'Iran (+98)' },
    { value: '+964', label: 'Iraq (+964)' },
    { value: '+353', label: 'Ireland (+353)' },
    { value: '+44-1624', label: 'Isle of Man (+44-1624)' },
    { value: '+972', label: 'Israel (+972)' },
    { value: '+39', label: 'Italy (+39)' },
    { value: '+225', label: 'Ivory Coast (+225)' },
    { value: '+1-876', label: 'Jamaica (+1-876)' },
    { value: '+81', label: 'Japan (+81)' },
    { value: '+44-1534', label: 'Jersey (+44-1534)' },
    { value: '+962', label: 'Jordan (+962)' },
    { value: '+7', label: 'Kazakhstan (+7)' },
    { value: '+254', label: 'Kenya (+254)' },
    { value: '+686', label: 'Kiribati (+686)' },
    { value: '+383', label: 'Kosovo (+383)' },
    { value: '+965', label: 'Kuwait (+965)' },
    { value: '+996', label: 'Kyrgyzstan (+996)' },
    { value: '+856', label: 'Laos (+856)' },
    { value: '+371', label: 'Latvia (+371)' },
    { value: '+961', label: 'Lebanon (+961)' },
    { value: '+266', label: 'Lesotho (+266)' },
    { value: '+231', label: 'Liberia (+231)' },
    { value: '+218', label: 'Libya (+218)' },
    { value: '+423', label: 'Liechtenstein (+423)' },
    { value: '+370', label: 'Lithuania (+370)' },
    { value: '+352', label: 'Luxembourg (+352)' },
    { value: '+853', label: 'Macau (+853)' },
    { value: '+389', label: 'Macedonia (+389)' },
    { value: '+261', label: 'Madagascar (+261)' },
    { value: '+265', label: 'Malawi (+265)' },
    { value: '+60', label: 'Malaysia (+60)' },
    { value: '+960', label: 'Maldives (+960)' },
    { value: '+223', label: 'Mali (+223)' },
    { value: '+356', label: 'Malta (+356)' },
    { value: '+692', label: 'Marshall Islands (+692)' },
    { value: '+596', label: 'Martinique (+596)' },
    { value: '+222', label: 'Mauritania (+222)' },
    { value: '+230', label: 'Mauritius (+230)' },
    { value: '+262', label: 'Mayotte (+262)' },
    { value: '+52', label: 'Mexico (+52)' },
    { value: '+691', label: 'Micronesia (+691)' },
    { value: '+373', label: 'Moldova (+373)' },
    { value: '+377', label: 'Monaco (+377)' },
    { value: '+976', label: 'Mongolia (+976)' },
    { value: '+382', label: 'Montenegro (+382)' },
    { value: '+1-664', label: 'Montserrat (+1-664)' },
    { value: '+212', label: 'Morocco (+212)' },
    { value: '+258', label: 'Mozambique (+258)' },
    { value: '+95', label: 'Myanmar (+95)' },
    { value: '+264', label: 'Namibia (+264)' },
    { value: '+674', label: 'Nauru (+674)' },
    { value: '+977', label: 'Nepal (+977)' },
    { value: '+31', label: 'Netherlands (+31)' },
    { value: '+599_B', label: 'Netherlands Antilles (+599)' },
    { value: '+687', label: 'New Caledonia (+687)' },
    { value: '+64', label: 'New Zealand (+64)' },
    { value: '+505', label: 'Nicaragua (+505)' },
    { value: '+227', label: 'Niger (+227)' },
    { value: '+234', label: 'Nigeria (+234)' },
    { value: '+683', label: 'Niue (+683)' },
    { value: '+672', label: 'Norfolk Island (+672)' },
    { value: '+850', label: 'North Korea (+850)' },
    { value: '+1-670', label: 'Northern Mariana Islands (+1-670)' },
    { value: '+47', label: 'Norway (+47)' },
    { value: '+968', label: 'Oman (+968)' },
    { value: '+92', label: 'Pakistan (+92)' },
    { value: '+680', label: 'Palau (+680)' },
    { value: '+970', label: 'Palestine (+970)' },
    { value: '+507', label: 'Panama (+507)' },
    { value: '+675', label: 'Papua New Guinea (+675)' },
    { value: '+595', label: 'Paraguay (+595)' },
    { value: '+51', label: 'Peru (+51)' },
    { value: '+63', label: 'Philippines (+63)' },
    { value: '+64_B', label: 'Pitcairn (+64)' },
    { value: '+48', label: 'Poland (+48)' },
    { value: '+351', label: 'Portugal (+351)' },
    { value: '+1-787', label: 'Puerto Rico (+1-787)' },
    { value: '+1-939', label: 'Puerto Rico (+1-939)' },
    { value: '+974', label: 'Qatar (+974)' },
    { value: '+242', label: 'Republic of the Congo (+242)' },
    { value: '+262_B', label: 'Reunion (+262)' },
    { value: '+40', label: 'Romania (+40)' },
    { value: '+7_B', label: 'Russia (+7)' },
    { value: '+250', label: 'Rwanda (+250)' },
    { value: '+590_B', label: 'Saint Barthelemy (+590)' },
    { value: '+290', label: 'Saint Helena (+290)' },
    { value: '+1-869', label: 'Saint Kitts and Nevis (+1-869)' },
    { value: '+1-758', label: 'Saint Lucia (+1-758)' },
    { value: '+590_C', label: 'Saint Martin (+590)' },
    { value: '+508', label: 'Saint Pierre and Miquelon (+508)' },
    { value: '+1-784', label: 'Saint Vincent and the Grenadines (+1-784)' },
    { value: '+685', label: 'Samoa (+685)' },
    { value: '+378', label: 'San Marino (+378)' },
    { value: '+239', label: 'Sao Tome and Principe (+239)' },
    { value: '+966', label: 'Saudi Arabia (+966)' },
    { value: '+221', label: 'Senegal (+221)' },
    { value: '+381', label: 'Serbia (+381)' },
    { value: '+248', label: 'Seychelles (+248)' },
    { value: '+232', label: 'Sierra Leone (+232)' },
    { value: '+65', label: 'Singapore (+65)' },
    { value: '+1-721', label: 'Sint Maarten (+1-721)' },
    { value: '+421', label: 'Slovakia (+421)' },
    { value: '+386', label: 'Slovenia (+386)' },
    { value: '+677', label: 'Solomon Islands (+677)' },
    { value: '+252', label: 'Somalia (+252)' },
    { value: '+27', label: 'South Africa (+27)' },
    { value: '+500_B', label: 'South Georgia and the South Sandwich Islands (+500)' },
    { value: '+82', label: 'South Korea (+82)' },
    { value: '+211', label: 'South Sudan (+211)' },
    { value: '+34', label: 'Spain (+34)' },
    { value: '+94', label: 'Sri Lanka (+94)' },
    { value: '+249', label: 'Sudan (+249)' },
    { value: '+597', label: 'Suriname (+597)' },
    { value: '+47_B', label: 'Svalbard and Jan Mayen (+47)' },
    { value: '+268', label: 'Swaziland (+268)' },
    { value: '+46', label: 'Sweden (+46)' },
    { value: '+41', label: 'Switzerland (+41)' },
    { value: '+963', label: 'Syria (+963)' },
    { value: '+886', label: 'Taiwan (+886)' },
    { value: '+992', label: 'Tajikistan (+992)' },
    { value: '+255', label: 'Tanzania (+255)' },
    { value: '+66', label: 'Thailand (+66)' },
    { value: '+228', label: 'Togo (+228)' },
    { value: '+690', label: 'Tokelau (+690)' },
    { value: '+676', label: 'Tonga (+676)' },
    { value: '+1-868', label: 'Trinidad and Tobago (+1-868)' },
    { value: '+216', label: 'Tunisia (+216)' },
    { value: '+90', label: 'Turkey (+90)' },
    { value: '+993', label: 'Turkmenistan (+993)' },
    { value: '+1-649', label: 'Turks and Caicos Islands (+1-649)' },
    { value: '+688', label: 'Tuvalu (+688)' },
    { value: '+1-340', label: 'U.S. Virgin Islands (+1-340)' },
    { value: '+256', label: 'Uganda (+256)' },
    { value: '+380', label: 'Ukraine (+380)' },
    { value: '+971', label: 'United Arab Emirates (+971)' },
    { value: '+44', label: 'United Kingdom (+44)' },
    { value: '+1_B', label: 'United States (+1)' },
    { value: '+598', label: 'Uruguay (+598)' },
    { value: '+998', label: 'Uzbekistan (+998)' },
    { value: '+678', label: 'Vanuatu (+678)' },
    { value: '+379', label: 'Vatican (+379)' },
    { value: '+58', label: 'Venezuela (+58)' },
    { value: '+84', label: 'Vietnam (+84)' },
    { value: '+681', label: 'Wallis and Futuna (+681)' },
    { value: '+212_B', label: 'Western Sahara (+212)' },
    { value: '+967', label: 'Yemen (+967)' },
    { value: '+260', label: 'Zambia (+260)' },
    { value: '+263', label: 'Zimbabwe (+263)' }
];


function PhoneNumberInput({ value, onChange, disabled }: { value: string, onChange: (newValue: string) => void, disabled?: boolean }) {
    const [countryCode, setCountryCode] = useState('+1');
    const [localNumber, setLocalNumber] = useState('');
    const [open, setOpen] = React.useState(false)

    useEffect(() => {
        if (!value) {
            setCountryCode('+1');
            setLocalNumber('');
            return;
        };

        const existingCode = countryCodes
            .map(c => c.value.trim())
            .filter(v => value.startsWith(v))
            .sort((a,b) => b.length - a.length)[0];

        if (existingCode) {
            setCountryCode(existingCode);
            setLocalNumber(value.substring(existingCode.length));
        } else {
            setCountryCode('+1');
            setLocalNumber(value);
        }
    }, [value]);
    
    const handleCodeChange = (newCodeValue: string) => {
        const newCode = newCodeValue.trim();
        setCountryCode(newCode);
        onChange(`${newCode}${localNumber}`);
        setOpen(false)
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value.replace(/\D/g, ''); // only allow digits
        setLocalNumber(newNumber);
        onChange(`${countryCode}${newNumber}`);
    };

    return (
        <div className="flex gap-2">
             <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[180px] justify-between"
                        disabled={disabled}
                    >
                        {countryCode
                            ? countryCodes.find((c) => c.value === countryCode)?.value
                            : "Select code..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countryCodes.map((c) => (
                                    <CommandItem
                                        key={c.value}
                                        value={c.label}
                                        onSelect={() => handleCodeChange(c.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                countryCode === c.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {c.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input 
                type="tel" 
                value={localNumber}
                onChange={handleNumberChange}
                disabled={disabled}
                placeholder="5551234567"
            />
        </div>
    );
}


export function DynamicProfileInput({ id, label, value, onChange, disabled, required }: DynamicProfileInputProps) {
    const handleSelectChange = (newValue: string) => {
        onChange(newValue, id);
    };

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            onChange(format(newDate, "yyyy-MM-dd"), id);
        }
    }

    const handleBooleanSelectChange = (newValue: string) => {
        onChange(newValue === 'true', id);
    }

    switch (id) {
        case 'bio':
        case 'deliveryInstructions':
            return <Textarea id={id} name={id} value={value || ''} onChange={(e) => onChange(e, id)} disabled={disabled} placeholder={`Your ${label}`} rows={3} />;
        
        case 'phoneNumber':
            return <PhoneNumberInput value={value || ''} onChange={(newValue) => onChange(newValue, id)} disabled={disabled} />;

        case 'ageGroup':
            return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled} required={required}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select age group" /></SelectTrigger>
                    <SelectContent>
                        {ageGroups.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'dateOfBirth':
            return (
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(parseISO(value), "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ? parseISO(value) : undefined}
                        onSelect={handleDateChange}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            )

        case 'pronouns':
            return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select pronouns" /></SelectTrigger>
                    <SelectContent>
                        {pronouns.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'contactPreference':
            return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select preference" /></SelectTrigger>
                    <SelectContent>
                        {contactPreferences.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'professionalStatus':
            return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {professionalStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'themePreference':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select theme" /></SelectTrigger>
                    <SelectContent>
                        {themePreferences.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'notificationPreference':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select preference" /></SelectTrigger>
                    <SelectContent>
                        {notificationPreferences.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'twoFactorPreference':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select preference" /></SelectTrigger>
                    <SelectContent>
                        {twoFactorPreferences.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        case 'preferredOs':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select OS" /></SelectTrigger>
                    <SelectContent>
                        {osPreferences.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'accountVisibility':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select visibility" /></SelectTrigger>
                    <SelectContent>
                        {accountVisibilities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'dataSharingConsent':
             return (
                <Select value={value?.toString() || ''} onValueChange={handleBooleanSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select choice" /></SelectTrigger>
                    <SelectContent>
                        {dataSharingConsents.map(s => <SelectItem key={s.value.toString()} value={s.value.toString()}>{s.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'marketingEmailsOptIn':
             return (
                <Select value={value?.toString() || ''} onValueChange={handleBooleanSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select choice" /></SelectTrigger>
                    <SelectContent>
                        {marketingOptIns.map(s => <SelectItem key={s.value.toString()} value={s.value.toString()}>{s.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'sessionTimeout':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                        {sessionTimeouts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        
        case 'preferredPaymentMethod':
             return (
                <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
                    <SelectTrigger id={id}><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                        {paymentMethods.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );

        default:
            const inputType = id.includes('Email') ? 'email' : id.includes('Url') || id.includes('Link') || id.includes('Profile') ? 'url' : 'text';
            return <Input id={id} name={id} type={inputType} value={value || ''} onChange={(e) => onChange(e, id)} disabled={disabled} required={required} />;
    }
}

    
